const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// You'll need to download your service account key from Firebase console
// Place it in a secure location and update this path
const serviceAccountPath = resolve('./serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

console.log('Firebase Admin initialized');

// Clear existing data (optional - be careful with this in production!)
async function clearCollections() {
  const collections = [
    'users', 
    'tasks', 
    'attendance', 
    'evaluations', 
    'feedback', 
    'systemLogs', 
    'systemSettings'
  ];
  
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      console.log(`Collection ${collectionName} is already empty`);
      continue;
    }
    
    console.log(`Deleting ${batchSize} documents from ${collectionName}...`);
    
    // Delete in batches to avoid API limits
    const batches = [];
    let batch = db.batch();
    let operationCount = 0;
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      operationCount++;
      
      if (operationCount === 500) {  // Firestore limit is 500 operations per batch
        batches.push(batch.commit());
        batch = db.batch();
        operationCount = 0;
      }
    });
    
    if (operationCount > 0) {
      batches.push(batch.commit());
    }
    
    await Promise.all(batches);
    console.log(`Deleted all documents from ${collectionName}`);
  }
}

// Setup demo users
async function createUsers() {
  console.log('Creating users...');
  
  // Predefined users for demo
  const users = [
    {
      email: 'admin@emms.com',
      password: 'admin123',
      displayName: 'Admin User',
      role: 'admin',
      department: 'IT',
      phoneNumber: '555-123-4567',
      hireDate: '2022-01-15',
      active: true
    },
    {
      email: 'ceo@emms.com',
      password: 'ceo123',
      displayName: 'Alex Johnson',
      role: 'ceo',
      department: 'Executive',
      phoneNumber: '555-987-6543',
      hireDate: '2021-03-10',
      active: true
    },
    {
      email: 'manager@emms.com',
      password: 'manager123',
      displayName: 'Sam Wilson',
      role: 'manager',
      department: 'Engineering',
      phoneNumber: '555-456-7890',
      hireDate: '2022-02-20',
      active: true
    },
    {
      email: 'employee@emms.com',
      password: 'employee123',
      displayName: 'Jamie Smith',
      role: 'employee',
      department: 'Engineering',
      phoneNumber: '555-789-0123',
      hireDate: '2022-06-15',
      active: true,
      managerId: null  // We'll update this after creating the manager
    }
  ];
  
  // Additional managers for departments
  const managers = [
    {
      email: 'sales.manager@emms.com',
      password: 'manager123',
      displayName: 'Morgan Lee',
      role: 'manager',
      department: 'Sales',
      phoneNumber: '555-234-5678',
      hireDate: '2022-01-05',
      active: true
    },
    {
      email: 'marketing.manager@emms.com',
      password: 'manager123',
      displayName: 'Taylor Reed',
      role: 'manager',
      department: 'Marketing',
      phoneNumber: '555-345-6789',
      hireDate: '2022-03-15',
      active: true
    },
    {
      email: 'hr.manager@emms.com',
      password: 'manager123',
      displayName: 'Jordan Patel',
      role: 'manager',
      department: 'Human Resources',
      phoneNumber: '555-456-7891',
      hireDate: '2022-02-10',
      active: true
    }
  ];
  
  // Additional employees for each department
  const employees = [
    // Engineering team
    {
      email: 'engineer1@emms.com',
      password: 'employee123',
      displayName: 'Robin Chen',
      role: 'employee',
      department: 'Engineering',
      phoneNumber: '555-123-4560',
      hireDate: '2022-08-10',
      active: true,
      skills: ['JavaScript', 'React', 'Node.js']
    },
    {
      email: 'engineer2@emms.com',
      password: 'employee123',
      displayName: 'Alex Rodriguez',
      role: 'employee',
      department: 'Engineering',
      phoneNumber: '555-123-4561',
      hireDate: '2022-09-15',
      active: true,
      skills: ['Python', 'Django', 'AWS']
    },
    {
      email: 'engineer3@emms.com',
      password: 'employee123',
      displayName: 'Riley Thompson',
      role: 'employee',
      department: 'Engineering',
      phoneNumber: '555-123-4562',
      hireDate: '2022-10-01',
      active: true,
      skills: ['Java', 'Spring', 'Kubernetes']
    },
    
    // Sales team
    {
      email: 'sales1@emms.com',
      password: 'employee123',
      displayName: 'Casey Williams',
      role: 'employee',
      department: 'Sales',
      phoneNumber: '555-234-5670',
      hireDate: '2022-07-15',
      active: true
    },
    {
      email: 'sales2@emms.com',
      password: 'employee123',
      displayName: 'Avery Davis',
      role: 'employee',
      department: 'Sales',
      phoneNumber: '555-234-5671',
      hireDate: '2022-08-22',
      active: true
    },
    
    // Marketing team
    {
      email: 'marketing1@emms.com',
      password: 'employee123',
      displayName: 'Parker Kim',
      role: 'employee',
      department: 'Marketing',
      phoneNumber: '555-345-6780',
      hireDate: '2022-09-05',
      active: true
    },
    {
      email: 'marketing2@emms.com',
      password: 'employee123',
      displayName: 'Jordan Nguyen',
      role: 'employee',
      department: 'Marketing',
      phoneNumber: '555-345-6781',
      hireDate: '2022-10-12',
      active: true
    },
    
    // HR team
    {
      email: 'hr1@emms.com',
      password: 'employee123',
      displayName: 'Quinn Foster',
      role: 'employee',
      department: 'Human Resources',
      phoneNumber: '555-456-7892',
      hireDate: '2022-07-01',
      active: true
    }
  ];
  
  // Merge all users
  const allUsers = [...users, ...managers, ...employees];
  
  // Create users in Firebase Authentication and Firestore
  const userMap = {};
  
  for (const user of allUsers) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName
      });
      
      const uid = userRecord.uid;
      
      // Store UID for later reference
      userMap[user.email] = uid;
      
      // Remove password before storing in Firestore
      const { password, ...userData } = user;
      
      // Add user to Firestore
      await db.collection('users').doc(uid).set({
        ...userData,
        createdAt: FieldValue.serverTimestamp(),
        lastUpdatedAt: FieldValue.serverTimestamp()
      });
      
      console.log(`Created user: ${user.displayName} (${user.email})`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
  
  // Update manager references
  // Assign employees to managers based on department
  const managersByDept = {};
  
  // Find manager UIDs by department
  for (const user of [...users, ...managers]) {
    if (user.role === 'manager') {
      managersByDept[user.department] = userMap[user.email];
    }
  }
  
  // Update employee records with manager IDs
  for (const employee of [...users, ...employees]) {
    if (employee.role === 'employee') {
      const managerId = managersByDept[employee.department];
      
      if (managerId) {
        await db.collection('users').doc(userMap[employee.email]).update({
          managerId
        });
        console.log(`Updated ${employee.email} with manager ID: ${managerId}`);
      }
    }
  }
  
  return userMap;
}

// Create tasks
async function createTasks(userMap) {
  console.log('Creating tasks...');
  
  const departments = ['Engineering', 'Sales', 'Marketing', 'Human Resources'];
  const tasks = [];
  
  // Get user IDs by role and department
  const employeesByDept = {};
  const managersByDept = {};
  
  // Group users by department and role
  const usersCollection = await db.collection('users').get();
  
  usersCollection.forEach(doc => {
    const userData = doc.data();
    const dept = userData.department;
    const userId = doc.id;
    
    if (!employeesByDept[dept]) {
      employeesByDept[dept] = [];
    }
    
    if (userData.role === 'employee') {
      employeesByDept[dept].push(userId);
    } else if (userData.role === 'manager') {
      managersByDept[dept] = userId;
    }
  });
  
  // Current date
  const now = new Date();
  
  // Helper to generate a date relative to now
  const relativeDays = (days) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return date;
  };
  
  // Task priorities
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  // Task templates
  const taskTemplates = {
    'Engineering': [
      { title: 'Implement new API endpoint', description: 'Create a RESTful API endpoint for the new feature.' },
      { title: 'Fix UI bug in dashboard', description: 'Fix the alignment issue on the dashboard cards.' },
      { title: 'Optimize database queries', description: 'Improve the performance of the main dashboard queries.' },
      { title: 'Setup CI/CD pipeline', description: 'Configure automated testing and deployment.' },
      { title: 'Code review', description: 'Review pull request for new authentication module.' },
      { title: 'Update dependencies', description: 'Update all npm packages to their latest stable versions.' },
      { title: 'Write unit tests', description: 'Add test coverage for the user management module.' }
    ],
    'Sales': [
      { title: 'Contact lead from conference', description: 'Follow up with potential client from tech conference.' },
      { title: 'Prepare sales presentation', description: 'Create slides for the enterprise client pitch.' },
      { title: 'Update CRM records', description: 'Ensure all client data is up to date in the CRM system.' },
      { title: 'Generate monthly sales report', description: 'Compile data and prepare the sales performance report.' },
      { title: 'Client follow-up call', description: 'Schedule a call to discuss implementation timeline.' }
    ],
    'Marketing': [
      { title: 'Create social media content', description: 'Develop content for next week\'s social media posts.' },
      { title: 'Analyze campaign results', description: 'Review metrics from the latest marketing campaign.' },
      { title: 'Update website copy', description: 'Revise the product description page based on feedback.' },
      { title: 'Design newsletter template', description: 'Create a new template for the monthly newsletter.' },
      { title: 'SEO keyword research', description: 'Identify new keywords to target in the blog content.' }
    ],
    'Human Resources': [
      { title: 'Review job applications', description: 'Screen resumes for the open developer position.' },
      { title: 'Schedule interviews', description: 'Coordinate interview times with candidates and team members.' },
      { title: 'Update employee handbook', description: 'Revise policies based on new regulations.' },
      { title: 'Organize team building event', description: 'Plan activities for the quarterly team building day.' },
      { title: 'Process payroll', description: 'Ensure all time records are approved and process monthly payroll.' }
    ]
  };
  
  // Generate tasks for each department
  for (const dept of departments) {
    const employees = employeesByDept[dept] || [];
    const manager = managersByDept[dept];
    
    if (!employees.length || !manager) continue;
    
    const templates = taskTemplates[dept] || [];
    
    // Create different task types for each employee
    for (const employeeId of employees) {
      // Create a mix of task statuses for each employee
      
      // Completed tasks (3-5 per employee)
      const completedCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < completedCount; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - (7 + Math.floor(Math.random() * 30)));
        
        const completedAt = new Date(createdAt);
        completedAt.setDate(completedAt.getDate() + (1 + Math.floor(Math.random() * 5)));
        
        tasks.push({
          title: template.title,
          description: template.description,
          assignedTo: employeeId,
          createdBy: manager,
          status: 'completed',
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          dueDate: completedAt.toISOString().split('T')[0],
          createdAt: Timestamp.fromDate(createdAt),
          completedAt: Timestamp.fromDate(completedAt),
          updatedAt: Timestamp.fromDate(completedAt)
        });
      }
      
      // In-progress tasks (1-3 per employee)
      const inProgressCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < inProgressCount; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - (1 + Math.floor(Math.random() * 10)));
        
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + (3 + Math.floor(Math.random() * 14)));
        
        tasks.push({
          title: template.title,
          description: template.description,
          assignedTo: employeeId,
          createdBy: manager,
          status: 'in_progress',
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          dueDate: dueDate.toISOString().split('T')[0],
          createdAt: Timestamp.fromDate(createdAt),
          completedAt: null,
          updatedAt: Timestamp.fromDate(createdAt)
        });
      }
      
      // Not started tasks (1-2 per employee)
      const notStartedCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < notStartedCount; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - (1 + Math.floor(Math.random() * 5)));
        
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + (5 + Math.floor(Math.random() * 20)));
        
        tasks.push({
          title: template.title,
          description: template.description,
          assignedTo: employeeId,
          createdBy: manager,
          status: 'not_started',
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          dueDate: dueDate.toISOString().split('T')[0],
          createdAt: Timestamp.fromDate(createdAt),
          completedAt: null,
          updatedAt: Timestamp.fromDate(createdAt)
        });
      }
      
      // Overdue tasks (0-2 per employee)
      const overdueCount = Math.floor(Math.random() * 2);
      for (let i = 0; i < overdueCount; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - (15 + Math.floor(Math.random() * 15)));
        
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() - (1 + Math.floor(Math.random() * 5)));
        
        tasks.push({
          title: template.title,
          description: template.description,
          assignedTo: employeeId,
          createdBy: manager,
          status: 'not_started', // Will be shown as overdue in UI due to due date
          priority: priorities[Math.floor(Math.random() * 2) + 2], // High or urgent priority for overdue tasks
          dueDate: dueDate.toISOString().split('T')[0],
          createdAt: Timestamp.fromDate(createdAt),
          completedAt: null,
          updatedAt: Timestamp.fromDate(createdAt)
        });
      }
    }
  }
  
  // Save tasks to Firestore
  const batch = db.batch();
  let batchCount = 0;
  let batchNumber = 1;
  
  for (const task of tasks) {
    const docRef = db.collection('tasks').doc();
    batch.set(docRef, task);
    batchCount++;
    
    // Firestore has a limit of 500 operations per batch
    if (batchCount >= 450) {
      await batch.commit();
      console.log(`Committed task batch ${batchNumber++}`);
      batchCount = 0;
    }
  }
  
  // Commit any remaining tasks
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final task batch ${batchNumber}`);
  }
  
  console.log(`Created ${tasks.length} tasks`);
  return tasks;
}

// Create attendance records
async function createAttendanceRecords() {
  console.log('Creating attendance records...');
  
  // Get all employees
  const employeesSnapshot = await db.collection('users')
    .where('role', '==', 'employee')
    .get();
  
  const employees = [];
  employeesSnapshot.forEach(doc => {
    employees.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  const attendance = [];
  const now = new Date();
  
  // Create attendance records for the past 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const recordDate = new Date(now);
    recordDate.setDate(recordDate.getDate() - dayOffset);
    recordDate.setHours(0, 0, 0, 0);
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = recordDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    const dateTimestamp = Timestamp.fromDate(recordDate);
    
    // For each employee, create an attendance record
    for (const employee of employees) {
      // 90% chance of being present
      const isPresent = Math.random() < 0.9;
      
      if (isPresent) {
        // 15% chance of being late
        const isLate = Math.random() < 0.15;
        
        // Create clock-in time (8:00 AM to 9:30 AM)
        const clockInHour = isLate ? 9 : 8;
        const clockInMinute = Math.floor(Math.random() * 60);
        const clockInDate = new Date(recordDate);
        clockInDate.setHours(clockInHour, clockInMinute);
        
        // Create clock-out time (4:30 PM to 6:00 PM)
        const clockOutHour = 16 + Math.floor(Math.random() * 2);
        const clockOutMinute = 30 + Math.floor(Math.random() * 30);
        const clockOutDate = new Date(recordDate);
        clockOutDate.setHours(clockOutHour, clockOutMinute);
        
        attendance.push({
          employeeId: employee.id,
          date: dateTimestamp,
          status: 'present',
          isLate,
          clockIn: Timestamp.fromDate(clockInDate),
          clockOut: Timestamp.fromDate(clockOutDate),
          createdAt: dateTimestamp,
          updatedAt: Timestamp.fromDate(clockOutDate)
        });
      } else {
        // Absent record
        attendance.push({
          employeeId: employee.id,
          date: dateTimestamp,
          status: 'absent',
          isLate: false,
          clockIn: null,
          clockOut: null,
          createdAt: dateTimestamp,
          updatedAt: dateTimestamp
        });
      }
    }
  }
  
  // Save attendance records to Firestore
  const batch = db.batch();
  let batchCount = 0;
  let batchNumber = 1;
  
  for (const record of attendance) {
    const docRef = db.collection('attendance').doc();
    batch.set(docRef, record);
    batchCount++;
    
    // Firestore has a limit of 500 operations per batch
    if (batchCount >= 450) {
      await batch.commit();
      console.log(`Committed attendance batch ${batchNumber++}`);
      batchCount = 0;
    }
  }
  
  // Commit any remaining records
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final attendance batch ${batchNumber}`);
  }
  
  console.log(`Created ${attendance.length} attendance records`);
}

// Create performance evaluations
async function createEvaluations() {
  console.log('Creating performance evaluations...');
  
  // Get all employees and their managers
  const employeesSnapshot = await db.collection('users')
    .where('role', '==', 'employee')
    .get();
  
  const employees = [];
  employeesSnapshot.forEach(doc => {
    employees.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  const evaluations = [];
  const feedback = [];
  const now = new Date();
  
  // Categories for evaluation
  const categories = [
    'taskCompletion',
    'quality',
    'communication',
    'teamwork',
    'initiative',
    'adaptability'
  ];
  
  // Create evaluations for each employee
  for (const employee of employees) {
    if (!employee.managerId) continue;
    
    // Create 2 evaluations for each employee
    for (let i = 0; i < 2; i++) {
      // First evaluation 3 months ago, second 1 month ago
      const evalDate = new Date(now);
      evalDate.setMonth(evalDate.getMonth() - (i === 0 ? 1 : 3));
      
      // Generate random scores (3-5)
      const overallRating = 3 + Math.random() * 2;
      
      // Generate category scores
      const categoryScores = {};
      categories.forEach(category => {
        categoryScores[category] = 3 + Math.random() * 2;
      });
      
      // Period (e.g., "Q1 2023")
      const quarter = Math.floor((evalDate.getMonth() + 3) / 3);
      const period = `Q${quarter} ${evalDate.getFullYear()}`;
      
      // Create evaluation
      evaluations.push({
        employeeId: employee.id,
        managerId: employee.managerId,
        date: Timestamp.fromDate(evalDate),
        period,
        overallRating,
        categories: categoryScores,
        comments: getRandomFeedbackComment(overallRating),
        createdAt: Timestamp.fromDate(evalDate)
      });
      
      // Create corresponding feedback
      feedback.push({
        employeeId: employee.id,
        givenBy: employee.managerId,
        giverName: 'Manager',
        giverRole: 'Manager',
        date: Timestamp.fromDate(evalDate),
        message: getRandomFeedbackComment(overallRating),
        rating: Math.round(overallRating),
        isAnonymous: false,
        createdAt: Timestamp.fromDate(evalDate)
      });
    }
    
    // Add peer feedback (1-2 per employee)
    const peerFeedbackCount = 1 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < peerFeedbackCount; i++) {
      const feedbackDate = new Date(now);
      feedbackDate.setDate(feedbackDate.getDate() - (5 + Math.floor(Math.random() * 60)));
      
      // Random rating (3-5)
      const rating = 3 + Math.floor(Math.random() * 3);
      
      // Get a peer from the same department (not the employee themselves)
      const potentialPeers = employees.filter(peer => 
        peer.id !== employee.id && peer.department === employee.department
      );
      
      if (potentialPeers.length > 0) {
        const peer = potentialPeers[Math.floor(Math.random() * potentialPeers.length)];
        
        feedback.push({
          employeeId: employee.id,
          givenBy: peer.id,
          giverName: peer.displayName,
          giverRole: 'Peer',
          date: Timestamp.fromDate(feedbackDate),
          message: getRandomPeerFeedback(rating),
          rating,
          isAnonymous: Math.random() < 0.3, // 30% chance of anonymous feedback
          createdAt: Timestamp.fromDate(feedbackDate)
        });
      }
    }
  }
  
  // Save evaluations to Firestore
  let batch = db.batch();
  let batchCount = 0;
  let batchNumber = 1;
  
  for (const evaluation of evaluations) {
    const docRef = db.collection('evaluations').doc();
    batch.set(docRef, evaluation);
    batchCount++;
    
    if (batchCount >= 450) {
      await batch.commit();
      console.log(`Committed evaluation batch ${batchNumber++}`);
      batch = db.batch();
      batchCount = 0;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final evaluation batch ${batchNumber}`);
  }
  
  // Save feedback to Firestore
  batch = db.batch();
  batchCount = 0;
  batchNumber = 1;
  
  for (const feedbackItem of feedback) {
    const docRef = db.collection('feedback').doc();
    batch.set(docRef, feedbackItem);
    batchCount++;
    
    if (batchCount >= 450) {
      await batch.commit();
      console.log(`Committed feedback batch ${batchNumber++}`);
      batch = db.batch();
      batchCount = 0;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final feedback batch ${batchNumber}`);
  }
  
  console.log(`Created ${evaluations.length} evaluations and ${feedback.length} feedback entries`);
}

// Create system logs
async function createSystemLogs() {
  console.log('Creating system logs...');
  
  // Get users by role
  const [adminSnap, managerSnap] = await Promise.all([
    db.collection('users').where('role', '==', 'admin').get(),
    db.collection('users').where('role', '==', 'manager').get()
  ]);
  
  let adminId, adminEmail;
  if (!adminSnap.empty) {
    const adminData = adminSnap.docs[0].data();
    adminId = adminSnap.docs[0].id;
    adminEmail = adminData.email;
  }
  
  const managers = [];
  managerSnap.forEach(doc => {
    managers.push({
      id: doc.id,
      email: doc.data().email
    });
  });
  
  const logs = [];
  const now = new Date();
  
  // Admin actions
  if (adminId) {
    // System configuration
    logs.push({
      action: 'System settings updated',
      user: { id: adminId, email: adminEmail },
      details: {
        updatedFields: ['notificationsEnabled', 'logRetentionDays', 'systemName']
      },
      timestamp: Timestamp.fromDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)) // 15 days ago
    });
    
    // User management
    logs.push({
      action: 'User created',
      user: { id: adminId, email: adminEmail },
      details: {
        createdUserEmail: 'newemployee@emms.com',
        role: 'employee'
      },
      timestamp: Timestamp.fromDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)) // 10 days ago
    });
    
    logs.push({
      action: 'User updated',
      user: { id: adminId, email: adminEmail },
      details: {
        updatedUserId: 'some-user-id',
        updatedFields: ['displayName', 'department'],
        previousRole: 'employee',
        newRole: 'employee'
      },
      timestamp: Timestamp.fromDate(new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)) // 8 days ago
    });
    
    logs.push({
      action: 'User deactivated',
      user: { id: adminId, email: adminEmail },
      details: {
        deactivatedUserId: 'some-user-id',
        deactivatedUserEmail: 'formeremployee@emms.com'
      },
      timestamp: Timestamp.fromDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)) // 5 days ago
    });
  }
  
  // Manager actions
  if (managers.length > 0) {
    // Randomly select managers for actions
    for (let i = 0; i < 20; i++) {
      const manager = managers[Math.floor(Math.random() * managers.length)];
      const actionDate = new Date(now.getTime() - (Math.random() * 30) * 24 * 60 * 60 * 1000); // Random date within last 30 days
      
      const actions = [
        {
          action: 'Task created',
          details: {
            taskId: `task-${Math.floor(Math.random() * 1000)}`,
            taskTitle: 'New development task',
            assignedTo: `employee-${Math.floor(Math.random() * 100)}`
          }
        },
        {
          action: 'Task updated',
          details: {
            taskId: `task-${Math.floor(Math.random() * 1000)}`,
            taskTitle: 'Updated task title',
            updatedFields: ['title', 'dueDate', 'description']
          }
        },
        {
          action: 'Performance evaluation submitted',
          details: {
            employeeId: `employee-${Math.floor(Math.random() * 100)}`,
            employeeName: 'Employee Name',
            evaluationId: `eval-${Math.floor(Math.random() * 1000)}`,
            overallRating: 3 + Math.random() * 2
          }
        },
        {
          action: 'Employee status updated',
          details: {
            employeeId: `employee-${Math.floor(Math.random() * 100)}`,
            newStatus: Math.random() > 0.5 ? 'active' : 'inactive'
          }
        }
      ];
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      logs.push({
        action: randomAction.action,
        user: { id: manager.id, email: manager.email },
        details: randomAction.details,
        timestamp: Timestamp.fromDate(actionDate)
      });
    }
  }
  
  // System actions
  for (let i = 0; i < 10; i++) {
    const actionDate = new Date(now.getTime() - (Math.random() * 30) * 24 * 60 * 60 * 1000);
    
    logs.push({
      action: 'System backup completed',
      user: { id: 'system', email: 'system@emms.com' },
      details: {
        backupSize: `${Math.floor(Math.random() * 100)}MB`,
        duration: `${Math.floor(Math.random() * 60)}s`
      },
      timestamp: Timestamp.fromDate(actionDate)
    });
  }
  
  // Save logs to Firestore
  const batch = db.batch();
  let batchCount = 0;
  let batchNumber = 1;
  
  for (const log of logs) {
    const docRef = db.collection('systemLogs').doc();
    batch.set(docRef, log);
    batchCount++;
    
    if (batchCount >= 450) {
      await batch.commit();
      console.log(`Committed logs batch ${batchNumber++}`);
      batchCount = 0;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final logs batch ${batchNumber}`);
  }
  
  console.log(`Created ${logs.length} system logs`);
}

// Create system settings
async function createSystemSettings() {
  console.log('Creating system settings...');
  
  const settings = {
    systemName: 'Innovatech EMMS',
    notificationsEnabled: true,
    logRetentionDays: 90,
    maintenanceMode: false,
    allowUserRegistration: false,
    emailNotifications: true,
    taskReminders: true,
    theme: 'light',
    timezone: 'UTC',
    workHours: {
      start: '09:00',
      end: '17:00'
    },
    lastUpdatedAt: FieldValue.serverTimestamp()
  };
  
  await db.collection('systemSettings').doc('general').set(settings);
  
  console.log('System settings created');
}

// Helper functions
function getRandomFeedbackComment(rating) {
  if (rating >= 4.5) {
    return 'Exceptional performance. Consistently exceeds expectations and demonstrates outstanding leadership qualities. A valuable team member who inspires others.';
  } else if (rating >= 4) {
    return 'Excellent work this period. Demonstrates strong skills across all areas and consistently delivers high-quality results.';
  } else if (rating >= 3.5) {
    return 'Good performance overall. Meets expectations consistently and shows initiative in some areas. Has potential for growth with additional focus.';
  } else if (rating >= 3) {
    return 'Satisfactory performance. Meets basic requirements but has opportunity to improve in several areas. Would benefit from more proactive approach.';
  } else {
    return 'Performance needs improvement. Not consistently meeting expectations. We should develop a plan to address specific areas of concern.';
  }
}

function getRandomPeerFeedback(rating) {
  if (rating >= 4.5) {
    return 'Working with this colleague has been a great experience. They\'re always willing to help others and bring innovative ideas to the team.';
  } else if (rating >= 4) {
    return 'A reliable team member who consistently delivers quality work and communicates effectively.';
  } else if (rating >= 3) {
    return 'Good team player with a positive attitude. Sometimes could improve on meeting deadlines, but overall contributes well to the team.';
  } else {
    return 'Has potential but needs to improve communication and follow-through on commitments to the team.';
  }
}

// Run the seeding process
async function seedDatabase() {
  try {
    // Clear existing data (optional - be careful!)
    // Uncomment the next line if you want to clear existing data
    // await clearCollections();
    
    // Create demo data
    const userMap = await createUsers();
    await createTasks(userMap);
    await createAttendanceRecords();
    await createEvaluations();
    await createSystemLogs();
    await createSystemSettings();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Execute the seeding
seedDatabase();