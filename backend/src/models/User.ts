import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface UserAttrs {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDoc extends Document, UserAttrs {}

/** Safe user shape returned by the API. Never includes passwordHash. */
export interface SafeUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Never selected by default; explicitly selected only during login.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    collection: 'users',
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        // Belt-and-braces: strip the hash even if explicitly selected.
        const { passwordHash: _removed, _id, ...rest } = ret as Record<string, unknown>;
        return { id: String(_id), ...rest };
      },
    },
  },
);

export function toSafeUser(user: UserDoc): SafeUser {
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const User: Model<UserDoc> =
  mongoose.models.User ?? mongoose.model<UserDoc>('User', userSchema);
