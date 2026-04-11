import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold text-amber-400">War Dominion</h1>
      <p className="text-slate-300">
        原创大型战争策略页游基础工程：已接入账号注册、登录、鉴权与玩家主页。
      </p>
      <div className="flex gap-3">
        <Link className="rounded bg-amber-500 px-4 py-2 font-semibold text-slate-950" href="/login">
          去登录
        </Link>
        <Link className="rounded border border-amber-500 px-4 py-2 text-amber-300" href="/register">
          去注册
        </Link>
      </div>
    </main>
  );
}
