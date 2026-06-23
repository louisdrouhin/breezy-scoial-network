import { Op } from "sequelize";
import { Profile, Follow } from "../models/index.js";

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

export const searchUsers = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  const profiles = await Profile.findAll({
    where: {
      [Op.or]: [
        { username: { [Op.iLike]: `%${q}%` } },
        { displayName: { [Op.iLike]: `%${q}%` } },
      ],
    },
    attributes: ['username', 'displayName', 'avatarUrl'],
    limit: 10,
  });

  return res.json(profiles);
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
