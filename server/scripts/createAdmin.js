import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.model.js';

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Platform Admin' } = process.env;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before running npm run create-admin.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters long.');
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
      console.log(`Admin account already exists for ${email}. No changes made.`);
    } else if (process.env.PROMOTE_EXISTING_USER === 'true') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Existing account ${email} was promoted to admin. Its existing password remains unchanged.`);
    } else {
      console.error(`An account already uses ${email}. To promote it, set PROMOTE_EXISTING_USER=true and run this command again. No password was changed.`);
      process.exitCode = 1;
    }
  } else {
    const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({ name: ADMIN_NAME.trim(), email, password, role: 'admin' });
    console.log(`Admin account created for ${email}. Sign in with these credentials, then remove ADMIN_PASSWORD from your local .env if desired.`);
  }
} catch (error) {
  console.error('Could not create admin:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
