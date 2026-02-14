import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        const result = await prisma.$queryRaw`PRAGMA table_info(Resume)`;
        console.log(JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
            , 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
