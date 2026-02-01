import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

async function seedTestAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if test accounts already exist
    const existingTeacher = await User.findOne({ email: 'teacher@spanishconnect.com' })
    const existingStudent = await User.findOne({ email: 'student@spanishconnect.com' })

    if (existingTeacher && existingStudent) {
      console.log('Test accounts already exist!')
      console.log('\n=== TEST CREDENTIALS ===')
      console.log('\nTeacher Account:')
      console.log('Email: teacher@spanishconnect.com')
      console.log('Password: Teacher123!')
      console.log('\nStudent Account:')
      console.log('Email: student@spanishconnect.com')
      console.log('Password: Student123!')
      console.log('========================\n')
      process.exit(0)
    }

    // Hash passwords
    const teacherPassword = await bcrypt.hash('Teacher123!', 12)
    const studentPassword = await bcrypt.hash('Student123!', 12)

    // Create teacher account
    if (!existingTeacher) {
      await User.create({
        email: 'teacher@spanishconnect.com',
        password: teacherPassword,
        username: 'profesora_maria',
        displayName: 'Profesora María',
        role: 'teacher',
        isEmailVerified: true,
        bio: 'Spanish language instructor with 10+ years of experience',
      })
      console.log('✓ Teacher account created')
    }

    // Create student account
    if (!existingStudent) {
      await User.create({
        email: 'student@spanishconnect.com',
        password: studentPassword,
        username: 'carlos_student',
        displayName: 'Carlos Mendez',
        role: 'student',
        isEmailVerified: true,
        bio: 'Learning Spanish for my career',
      })
      console.log('✓ Student account created')
    }

    console.log('\n=== TEST CREDENTIALS ===')
    console.log('\nTeacher Account:')
    console.log('Email: teacher@spanishconnect.com')
    console.log('Password: Teacher123!')
    console.log('Role: teacher')
    console.log('\nStudent Account:')
    console.log('Email: student@spanishconnect.com')
    console.log('Password: Student123!')
    console.log('Role: student')
    console.log('========================\n')

    console.log('Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seedTestAccounts()
