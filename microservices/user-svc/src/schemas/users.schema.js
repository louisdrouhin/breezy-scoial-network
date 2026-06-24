import { z } from "zod";

export const ProfileSchema = z.object({
  username: z.string().min(1).max(30),
  displayName: z.string().max(50).nullable(),
  bio: z.string().max(160).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  notifLikes: z.boolean().optional(),
  notifMentions: z.boolean().optional(),
  notifFollows: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProfileSchema = ProfileSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const UpdateProfileSchema = ProfileSchema.omit({
  username: true,
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined && v !== null),
    { message: "At least one field is required" },
  );

export const GetPublicProfileSchema = z.object({
  username: z.string().min(1).max(30),
});

export const FollowParamsSchema = z.object({
  username: z.string().min(1).max(30),
});
