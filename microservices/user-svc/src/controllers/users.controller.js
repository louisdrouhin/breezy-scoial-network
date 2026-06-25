import { Op } from "sequelize";
import sequelize from "../config/db.config.js";
import { Profile, Follow } from "../models/index.js";
import { notifyFollow } from "../services/notif.service.js";

const publicProfileAttributes = ['username', 'displayName', 'bio', 'avatarUrl', 'bannerUrl'];

const attachFollowStatus = async (profiles, viewerUsername) => {
  if (!viewerUsername || profiles.length === 0) {
    return profiles.map(profile => ({ ...profile.get({ plain: true }), isFollowing: false }));
  }

  const usernames = profiles.map(profile => profile.username);
  const follows = await Follow.findAll({
    where: {
      followerUsername: viewerUsername,
      followedUsername: { [Op.in]: usernames },
    },
    attributes: ['followedUsername'],
    raw: true,
  });
  const followedUsernames = new Set(follows.map(follow => follow.followedUsername));

  return profiles.map(profile => {
    const data = profile.get({ plain: true });
    return { ...data, isFollowing: followedUsernames.has(data.username) };
  });
};

export const getPublicProfile = async (req, res) => {
  const { username } = req.validated;

  const profile = await Profile.findOne({
    where: { username },
    attributes: ["username", "displayName", "bio", "avatarUrl", "bannerUrl"],
  });

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  res.status(200).json(profile);
};

export const getMyProfile = async (req, res) => {
  const { username } = req.user;

  const profile = await Profile.findOne({
    where: { username },
  });

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  res.status(200).json(profile);
};

export const updateMyProfile = async (req, res) => {
  const { username } = req.user;
  const updates = req.validated;

  await Profile.update(updates, {
    where: { username },
  });

  const updatedProfile = await Profile.findOne({
    where: { username },
  });

  res.status(200).json(updatedProfile);
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const { username } = req.user;
  // URL relative servie par Nginx (location /uploads/). On stocke le chemin
  // relatif et non une URL absolue : le front la résout via son origin.
  const avatarUrl = `/uploads/${req.file.filename}`;

  await Profile.update({ avatarUrl }, { where: { username } });

  res.status(200).json({ avatarUrl });
};

export const uploadBanner = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const { username } = req.user;
  const bannerUrl = `/uploads/${req.file.filename}`;

  await Profile.update({ bannerUrl }, { where: { username } });

  res.status(200).json({ bannerUrl });
};

export const searchUsers = async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const viewerUsername = req.user?.username;
  const defaultLimit = q ? 10 : 12;
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || defaultLimit));

  const where = viewerUsername ? { username: { [Op.ne]: viewerUsername } } : {};
  if (q) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${q}%` } },
      { displayName: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const profiles = await Profile.findAll({
    where,
    attributes: publicProfileAttributes,
    order: q ? [['username', 'ASC']] : sequelize.random(),
    limit,
  });

  return res.json(await attachFollowStatus(profiles, viewerUsername));
};

export const getNotifPrefs = async (req, res) => {
  const { username } = req.params;
  const profile = await Profile.findOne({
    where: { username },
    attributes: ['notifLikes', 'notifMentions', 'notifFollows'],
  });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json({
    notifLikes: profile.notifLikes ?? true,
    notifMentions: profile.notifMentions ?? true,
    notifFollows: profile.notifFollows ?? true,
  });
};

export const createProfile = async (req, res) => {
  const data = req.validated;

  const profile = await Profile.create(data);

  res.status(201).json(profile);
};

export const getFollowers = async (req, res) => {
  const { username } = req.validated;

  const followers = await Follow.findAll({
    where: { followedUsername: username },
    attributes: [],
    include: [
      {
        model: Profile,
        as: "follower",
        attributes: ["username", "avatarUrl"],
        foreignKey: "followerUsername",
      },
    ],
    raw: true,
  });

  res.status(200).json(followers);
};

export const getFollowing = async (req, res) => {
  const { username } = req.validated;

  const followed = await Follow.findAll({
    where: { followerUsername: username },
    attributes: [],
    include: [
      {
        model: Profile,
        as: "followed",
        attributes: ["username", "avatarUrl"],
        foreignKey: "followedUsername",
      },
    ],
    raw: true,
  });

  res.status(200).json(followed);
};

export const followUser = async (req, res) => {
  const { username } = req.validated;
  const { username: followerUsername } = req.user;

  if (username === followerUsername) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  const profile = await Profile.findOne({ where: { username } });
  if (!profile) {
    return res.status(404).json({ error: "User not found" });
  }

  await Follow.create({
    followerUsername,
    followedUsername: username,
  });

  notifyFollow(username, followerUsername);

  res.status(200).json({ followed: true });
};

export const unfollowUser = async (req, res) => {
  const { username } = req.validated;
  const { username: followerUsername } = req.user;

  await Follow.destroy({
    where: {
      followerUsername,
      followedUsername: username,
    },
  });

  res.status(200).json({ followed: false });
};
