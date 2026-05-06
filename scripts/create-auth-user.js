import process from "node:process";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import models from "../src/models/Associations.js";

dotenv.config();

const { User, Role, UserRole } = models;

function getArg(name) {
  const pair = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : "";
}

async function ensureRole(roleName) {
  let role = await Role.findOne({ where: { name: roleName } });
  if (!role) {
    role = await Role.create({ name: roleName });
  }
  return role;
}

async function main() {
  const firstname = getArg("--firstname");
  const lastname = getArg("--lastname");
  const email = getArg("--email");
  const password = getArg("--password");
  const roleName = getArg("--role");
  const age = Number(getArg("--age") || 30);
  const gender = getArg("--gender") || "male";
  const phoneNumber = getArg("--phone") || `+1000000${Date.now().toString().slice(-6)}`;

  if (!firstname || !lastname || !email || !password || !roleName) {
    throw new Error(
      "Missing required args. Use --firstname --lastname --email --password --role"
    );
  }

  const allowedRoles = new Set(["organizer", "super_admin", "host", "player"]);
  if (!allowedRoles.has(roleName)) {
    throw new Error(`Unsupported role '${roleName}'`);
  }

  let user = await User.findOne({ where: { email } });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      age,
      gender,
      phoneNumber,
      isVerified: true,
      accountExpiresAt: null,
      verificationToken: null,
    });
  }

  const role = await ensureRole(roleName);
  const existingUserRole = await UserRole.findOne({
    where: { userId: user.id, roleId: role.id },
  });
  if (!existingUserRole) {
    await UserRole.create({
      userId: user.id,
      roleId: role.id,
    });
  }

  console.log(
    JSON.stringify({
      success: true,
      userId: user.id,
      email: user.email,
      role: role.name,
      createdUser: !existingUserRole,
    })
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
