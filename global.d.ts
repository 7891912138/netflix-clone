// PrismaClient 是 Prisma ORM（对象关系映射）的客户端，用于与数据库进行交互。
import {PrismaClient} from '@prisma/client';

// 全局范围的声明合并
declare global {
    // 全局 globalThis 对象中添加新的属性
    namespace globalThis {
        // 声明了一个名为 prismadb 的全局变量，它的类型是 PrismaClient
        var prismadb: PrismaClient
    }
}