import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from './models/User.js'
import Post from './models/Post.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })

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
    } else {

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
    }

    // Seed posts
    await seedPosts()

    console.log('Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

async function seedPosts() {
  try {
    // Get the teacher and student for post creation
    const teacher = await User.findOne({ email: 'teacher@spanishconnect.com' })
    const student = await User.findOne({ email: 'student@spanishconnect.com' })
    
    if (!teacher || !student) {
      console.log('Users not found, skipping post creation')
      return
    }

    // Check if posts already exist
    const existingPosts = await Post.countDocuments()
    if (existingPosts > 0) {
      console.log('Posts already exist!')
      return
    }

    const samplePosts = [
      {
        author: teacher._id,
        content: "¡Hola estudiantes! Today we're learning about verb conjugations. Who can conjugate 'hablar' in present tense?",
        hashtags: ['#SpanishGrammar', '#Verbs'],
        likes: [],
        dislikes: [],
        comments: [],
        createdAt: new Date()
      },
      {
        author: student._id,
        content: "Just practiced my Spanish conversation skills today! Feeling more confident 😊 #SpanishLearning",
        hashtags: ['#SpanishLearning', '#Progress'],
        likes: [],
        dislikes: [],
        comments: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        author: teacher._id,
        content: "Remember: Practice makes perfect! 📚 Don't forget to complete your homework exercises.",
        hashtags: ['#StudyTips', '#Spanish'],
        likes: [],
        dislikes: [],
        comments: [],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        author: student._id,
        content: "Can someone help me understand the difference between 'ser' and 'estar'? 🤔",
        hashtags: ['#SpanishHelp', '#Grammar'],
        likes: [],
        dislikes: [],
        comments: [],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]

    await Post.insertMany(samplePosts)
    console.log('Sample posts created successfully!')
    
  } catch (error) {
    console.error('Error creating posts:', error)
  }
}

seedTestAccounts()
