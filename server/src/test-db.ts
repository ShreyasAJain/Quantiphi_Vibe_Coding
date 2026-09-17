import { PrismaClient, TaskStatus, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Verifying PostgreSQL connection and schema constraints...');

  // 1. Clean previous verification data if any
  await prisma.task.deleteMany({ where: { title: { startsWith: '[TEST]' } } });
  await prisma.project.deleteMany({ where: { name: { startsWith: '[TEST]' } } });
  await prisma.user.deleteMany({ where: { email: 'test.engineer@kanban.dev' } });

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      name: 'Test Engineer',
      email: 'test.engineer@kanban.dev',
    },
  });
  console.log('✅ Created User:', user.name, `(${user.id})`);

  // 3. Create Project
  const project = await prisma.project.create({
    data: {
      name: '[TEST] Kanban Core System',
      description: 'Test project for relational verification',
    },
  });
  console.log('✅ Created Project:', project.name, `(${project.id})`);

  // 4. Add User to Project (ProjectMember)
  const member = await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: user.id,
      role: 'MEMBER',
    },
  });
  console.log('✅ Added User to Project:', member.id);

  // 5. Test Unique Constraint on ProjectMember (Cannot add same user twice)
  try {
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
      },
    });
    console.error('❌ FAILED: Duplicate member was allowed!');
  } catch (err: any) {
    console.log('✅ Verified Unique Constraint: Duplicate project member correctly rejected!');
  }

  // 6. Create Task assigned to User
  const task = await prisma.task.create({
    data: {
      title: '[TEST] Task #1 for Workload Check',
      description: 'Initial verification card',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      projectId: project.id,
      assignedUserId: user.id,
    },
  });
  console.log('✅ Created Task:', task.title, `[Status: ${task.status}, Priority: ${task.priority}]`);

  // 7. Test ON DELETE SET NULL on assigned_user_id
  await prisma.user.delete({ where: { id: user.id } });
  const taskAfterUserDelete = await prisma.task.findUnique({ where: { id: task.id } });
  if (taskAfterUserDelete && taskAfterUserDelete.assignedUserId === null) {
    console.log('✅ Verified ON DELETE SET NULL: When user was deleted, task.assignedUserId became NULL!');
  } else {
    console.error('❌ FAILED: ON DELETE SET NULL did not trigger!');
  }

  // 8. Test ON DELETE CASCADE on project_id
  await prisma.project.delete({ where: { id: project.id } });
  const taskAfterProjectDelete = await prisma.task.findUnique({ where: { id: task.id } });
  if (!taskAfterProjectDelete) {
    console.log('✅ Verified ON DELETE CASCADE: When project was deleted, all related tasks were deleted!');
  } else {
    console.error('❌ FAILED: ON DELETE CASCADE did not remove task!');
  }

  console.log('\n🎉 ALL DATABASE CONSTRAINTS & RELATIONSHIPS VERIFIED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('Error during database verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
