import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prismadb from "@/lib/prismadb";
import {compare} from "bcrypt";
import GithubProvider from "next-auth/providers/github";
import {PrismaAdapter} from "@next-auth/prisma-adapter";

export default NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || '',
            clientSecret: process.env.GITHUB_SECRET || '',
        }),
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text'
                },
                password: {
                    label: 'Password',
                    type: 'password',
                }
            },
            // 从数据库中查询用户信息，验证邮箱是否存在，并比较密码是否正确。
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password required');
                }

                const user = await prismadb.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user || !user.hashedPassword) {
                    throw new Error('Email does not exist');
                }

                const isCorrectPassword = await compare(
                    credentials.password,
                    user.hashedPassword
                );

                if (!isCorrectPassword) {
                    throw new Error('Incorrect password');
                }

                return user;
            }
        })
    ],

    // 指定了登录页面的路径为 '/auth'
    pages: {
        signIn: '/auth',
    },

    // 根据环境变量设置调试模式，只有在开发环境下才启用调试模式。
    debug: process.env.NODE_ENV === 'development',

    // 配置适配器，将 NextAuth 与 Prisma 数据库适配器结合使用。
    adapter: PrismaAdapter(prismadb),
    // 配置会话管理策略，这里使用 JWT 策略。
    session: {
        strategy: 'jwt',
    },
    // 配置 JWT 密钥，用于生成和验证 JWT 令牌。
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    // 配置身份验证系统的密钥，用于对用户会话进行签名和加密。
    secret: process.env.NEXTAUTH_SECRET,
});
