import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import { connectDB } from "../../lib/db"
import { User } from "../../models/user"

// Load environment variables
dotenv.config()

async function createAdmin() {
  try {
    console.log("🔄 Connecting to MongoDB...")
    await connectDB()
    console.log("✅ Connected to MongoDB")

    // Admin user details
    const adminData = {
      name: "Admin User",
      email: "admin@shoplite.com",
      password: "admin123", // Change this!
      role: "admin" as const,
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email })
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists with email:", adminData.email)
      console.log("📧 Email:", existingAdmin.email)
      console.log("👤 Name:", existingAdmin.name)
      console.log("🔑 Role:", existingAdmin.role)
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10)

    // Create admin user
    const admin = await User.create({
      ...adminData,
      password: hashedPassword,
    })

    console.log("\n✅ Admin user created successfully!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📧 Email:    ", admin.email)
    console.log("🔒 Password: ", adminData.password)
    console.log("👤 Name:     ", admin.name)
    console.log("🔑 Role:     ", admin.role)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("\n⚠️  IMPORTANT: Change the password after first login!")
    console.log("🌐 Login at: http://localhost:3000/login")
    console.log("🛡️  Admin Dashboard: http://localhost:3000/admin\n")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    process.exit(1)
  }
}

createAdmin()
