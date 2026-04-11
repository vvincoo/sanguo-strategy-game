'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ApiError } from '../lib/api-client';
import { Faction } from '../lib/auth-api';
import { useAuthStore } from '../store/auth-store';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const factionOptions: Faction[] = ['wei', 'shu', 'wu', 'neutral'];

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [faction, setFaction] = useState<Faction>('neutral');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        await register({ email, password, nickname, faction });
      } else {
        await login({ email, password });
      }

      router.push('/home');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('请求失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-xl">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">
        {mode === 'register' ? '注册主公账号' : '登录主公账号'}
      </h1>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm text-slate-300">邮箱</label>
          <input
            className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">密码</label>
          <input
            className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {mode === 'register' && (
          <>
            <div>
              <label className="mb-1 block text-sm text-slate-300">昵称</label>
              <input
                className="w-full rounded border border-slate-700 bg-slate-800 p-2"
                required
                minLength={2}
                maxLength={16}
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">初始阵营</label>
              <select
                className="w-full rounded border border-slate-700 bg-slate-800 p-2"
                value={faction}
                onChange={(event) => setFaction(event.target.value as Faction)}
              >
                {factionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          className="w-full rounded bg-amber-500 py-2 font-semibold text-slate-950 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? '提交中...' : mode === 'register' ? '注册并进入主城' : '登录并进入主城'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-300">
        {mode === 'register' ? '已有账号？' : '没有账号？'}
        <Link
          className="ml-1 text-amber-400 hover:text-amber-300"
          href={mode === 'register' ? '/login' : '/register'}
        >
          {mode === 'register' ? '去登录' : '去注册'}
        </Link>
      </p>
    </div>
  );
}
