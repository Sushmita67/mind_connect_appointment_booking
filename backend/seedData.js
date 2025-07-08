const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Session = require("./models/Session");
const Appointment = require("./models/Appointment");

const connectDB = require("./middleware/db");

// Sample sessions data
const sessionsData = [
    {
        name: 'Calm Session',
        description: 'A specialized session using our Calm Card technique for anxiety relief',
        duration: 60,
        price: 1199,
        icon: '🃏',
        image: 'http://localhost:4000/uploads/calm_session.jpg',
        features: ['Anxiety relief', 'Stress management', 'Mindfulness techniques', 'Take-home exercises']
    },
    {
        name: 'Anxiety Management',
        description: 'Comprehensive approach to managing anxiety and panic attacks',
        duration: 45,
        price: 999,
        icon: '🧘',
        image: 'http://localhost:4000/uploads/anxiety_session.jpg',
        features: ['Panic attack prevention', 'Breathing techniques', 'Cognitive behavioral therapy', 'Coping strategies']
    },
    {
        name: 'Depression Support',
        description: 'Supportive therapy for managing depression and low mood',
        duration: 90,
        price: 1499,
        icon: '🌱',
        image: 'http://localhost:4000/uploads/depression_session.jpg',
        features: ['Mood improvement', 'Behavioral activation', 'Thought reframing', 'Lifestyle changes']
    },
    {
        name: 'Stress Relief',
        description: 'Relaxation techniques and stress management strategies.',
        duration: 30,
        price: 899,
        icon: '🌸',
        image: 'http://localhost:4000/uploads/stress_relief_session.jpg',
        features: ['Relaxation techniques', 'Time management', 'Boundary setting', 'Self-care planning']
    },
    {
        name: 'Mindfulness & Relaxation Training',
        description: 'Learn meditation, breathing exercises and grounding techniques.',
        duration: 60,
        price: 1199,
        icon: '🧘',
        image: 'http://localhost:4000/uploads/stress_relief_session.jpg',
        features: ['Relaxation techniques', 'Time management', 'Boundary setting', 'Self-care planning']
    },
    {
        name: 'Anger Management',
        description: 'Learn to control reactions and respond with calm.',
        duration: 45,
        price: 1099,
        icon: '😤',
        image: 'http://localhost:4000/uploads/depression_session.jpg',
        features: ['Mood improvement', 'Behavioral activation', 'Thought reframing', 'Lifestyle changes']
    },
    {
        name: 'Adolescent Support',
        description: 'Support for teenagers facing academic stress, peer pressure, identity challenges, and emotional ups and downs.',
        duration: 90,
        price: 1499,
        icon: '🤝',
        image: 'http://localhost:4000/uploads/depression_session.jpg',
        features: ['Mood improvement', 'Behavioral activation', 'Thought reframing', 'Lifestyle changes']
    },
    {
        name: 'Depression Support',
        description: 'Supportive therapy for managing depression and low mood',
        duration: 90,
        price: 1499,
        icon: '🌱',
        image: 'http://localhost:4000/uploads/depression_session.jpg',
        features: ['Mood improvement', 'Behavioral activation', 'Thought reframing', 'Lifestyle changes']
    },
];

// Sample therapists data
const therapistsData = [
    {
        name: 'Dr. Lata Shrestha',
        email: 'therapist@yopmail.com',
        password: '$2a$12$ATSs9EPeuX6dORhaL7C6iOtW/./.vzfA2BKscchEjD65gakrz5idC',
        phone: '+977 9812134578',
        specialization: 'Anxiety & Depression',
        experience: '8 years',
        rating: 4.9,
        reviews: 127,
        bio: 'Specialized in anxiety disorders and depression with a focus on evidence-based treatments.',
        availability: ['Sunday - Friday'],
        photo: 'http://localhost:4000/uploads/dr-lata-shrestha.jpg'
    },
    {
        name: 'Dr. Nyoman Gitanjaya',
        email: 'therapist1@yopmail.com',
        password: '$2a$12$ATSs9EPeuX6dORhaL7C6iOtW/./.vzfA2BKscchEjD65gakrz5idC',
        phone: '+977 9745874151',
        specialization: 'Stress Management',
        experience: '12 years',
        rating: 4.8,
        reviews: 203,
        bio: 'Expert in stress management and work-life balance with corporate wellness experience.',
        availability: ['Sunday - Friday'],
        photo: 'http://localhost:4000/uploads/dr-nyoman-gitanjaya.png'
    },
    {
        name: 'Dr. Bina Paudel',
        email: 'therapist2@yopmail.com',
        password: '$2a$12$ATSs9EPeuX6dORhaL7C6iOtW/./.vzfA2BKscchEjD65gakrz5idC',
        phone: '+977 9856784589',
        specialization: 'Trauma & PTSD',
        experience: '10 years',
        rating: 4.9,
        reviews: 156,
        bio: 'Trauma-informed therapist specializing in PTSD and complex trauma recovery.',
        availability: ['Sunday - Friday'],
        photo: 'http://localhost:4000/uploads/dr-ramri-aunty.jpg'
    },
    {
        name: 'Dr. Deepak Biswakarma',
        email: 'therapist3@yopmail.com',
        password: '$2a$12$ATSs9EPeuX6dORhaL7C6iOtW/./.vzfA2BKscchEjD65gakrz5idC',
        phone: '+977 9825456354',
        specialization: 'Relationship Counseling',
        experience: '15 years',
        rating: 4.7,
        reviews: 89,
        bio: 'Relationship expert helping couples and individuals build healthier connections.',
        availability: ['Sunday - Friday'],
        photo: 'http://localhost:4000/uploads/dr-yugal.jpg'
    }
];

// Sample admin user
const adminData = {
    name: 'Admin User',
    email: 'admin@mindconnect.com.np',
    password: '$2a$12$NF79y31bYSqq2k/kocTXReZyGaOO0SieMweeCaJG2ntndkbJdMuEG',
    phone: '+977 9827111450',
    role: 'admin',
    isActive: true
};

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to database');

        // Clear existing data
        await User.deleteMany({});
        await Session.deleteMany({});
        await Appointment.deleteMany({});
        console.log('Cleared existing data');

        // Create admin user
        const hashedAdminPassword = await bcrypt.hash(adminData.password, 10);
        const admin = new User({
            ...adminData,
            password: hashedAdminPassword
        });
        await admin.save();
        console.log('Created admin user');

        // Create therapists
        const therapists = [];
        for (const therapistData of therapistsData) {
            const hashedPassword = await bcrypt.hash(therapistData.password, 10);
            const therapist = new User({
                ...therapistData,
                password: hashedPassword,
                role: 'therapist',
                isActive: true
            });
            await therapist.save();
            therapists.push(therapist);
        }
        console.log('Created therapists');

        // Create sessions
        const sessions = [];
        for (const sessionData of sessionsData) {
            const session = new Session(sessionData);
            await session.save();
            sessions.push(session);
        }
        console.log('Created sessions');

        // Define appointmentsData before using it
        const appointmentsData = [];
        // Add three more dummy appointments for therapist1, therapist2, and therapist3
        if (therapists.length >= 4 && sessions.length >= 4) {
          appointmentsData.push(
            {
              client: null,
              therapist: therapists[1]._id, // therapist1@yopmail.com
              session: sessions[1]._id,
              date: new Date(Date.now() + 3 * 86400000),
              time: '11:00 AM',
              duration: 60,
              price: 1199,
              location: 'Virtual Session',
              paymentMethod: 'Credit Card',
              paymentStatus: 'paid',
              status: 'confirmed',
              prescription: 'Practice deep breathing exercises daily.'
            },
            {
              client: null,
              therapist: therapists[2]._id, // therapist2@yopmail.com
              session: sessions[2]._id,
              date: new Date(Date.now() + 4 * 86400000),
              time: '1:00 PM',
              duration: 45,
              price: 999,
              location: 'Virtual Session',
              paymentMethod: 'Credit Card',
              paymentStatus: 'paid',
              status: 'confirmed',
              prescription: 'Keep a gratitude journal.'
            },
            {
              client: null,
              therapist: therapists[3]._id, // therapist3@yopmail.com
              session: sessions[3]._id,
              date: new Date(Date.now() + 5 * 86400000),
              time: '3:00 PM',
              duration: 90,
              price: 1499,
              location: 'Virtual Session',
              paymentMethod: 'Credit Card',
              paymentStatus: 'paid',
              status: 'confirmed',
              prescription: 'Try progressive muscle relaxation before bed.'
            }
          );
        }
        // Seed appointments
        for (const appointmentData of appointmentsData) {
          const appointment = new Appointment(appointmentData);
          await appointment.save();
        }
        console.log('Created appointments with prescription field.');

        console.log('Database seeded successfully!');
        console.log(`Created ${therapists.length} therapists`);
        console.log(`Created ${sessions.length} sessions`);
        console.log('Admin credentials: admin@mindconnect.com / admin123');
        console.log('Demo user credentials: demo@example.com / password');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed function
seedDatabase(); 