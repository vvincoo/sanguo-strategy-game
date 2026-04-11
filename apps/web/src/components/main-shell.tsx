'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  authApi,
  BuildingItem,
  BuildingQueueItem,
  CityInfo,
  PlayerHome,
  ResourceInfo
} from '../lib/auth-api';
import { ApiError } from '../lib/api-client';
import { useAuthStore } from '../store/auth-store';
import { BuildingPanel } from './building-panel';

const RESOURCE_LABELS = {
  food: '粮草',
  wood: '木材',
  iron: '铁矿',
  stone: '石料',
  gold: '金币',
  gem: '元宝'
} as const;

const RESOURCE_KEYS = Object.keys(RESOURCE_LABELS) as Array<keyof typeof RESOURCE_LABELS>;

export function MainShell() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [player, setPlayer] = useState<PlayerHome | null>(null);
  const [city, setCity] = useState<CityInfo | null>(null);
  const [resources, setResources] = useState<ResourceInfo | null>(null);
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [queues, setQueues] = useState<BuildingQueueItem[]>([]);
  const [error, setError] = useState('');

  async function loadAllData(currentToken: string) {
    const [me, cityInfo, resourceInfo, buildingList, queueList] = await Promise.all([
      authApi.getMe(currentToken),
      authApi.getCity(currentToken),
      authApi.getResources(currentToken),
      authApi.getBuildings(currentToken),
      authApi.getBuildingQueues(currentToken)
    ]);

    setPlayer(me);
    setCity(cityInfo);
    setResources(resourceInfo);
    setBuildings(buildingList);
    setQueues(queueList);
  }

  useEffect(() => {
    async function fetchHomeData() {
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        await authApi.settleBuildingQueue(token);
        await loadAllData(token);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace('/login');
          return;
        }
        setError('加载主城数据失败');
      }
    }

    fetchHomeData();
  }, [token, logout, router]);

  if (!token) {
    return <p className="p-6 text-slate-300">正在检查登录状态...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-400">{error}</p>;
  }

  if (!player || !city || !resources) {
    return <p className="p-6 text-slate-300">主城载入中...</p>;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 p-6">
      <section className="grid grid-cols-2 gap-2 rounded-lg bg-slate-900 p-3 md:grid-cols-3 lg:grid-cols-6">
        {RESOURCE_KEYS.map((key) => (
          <article key={key} className="rounded bg-slate-800 p-2 text-sm">
            <p className="text-slate-300">{RESOURCE_LABELS[key]}</p>
            <p className="font-semibold text-amber-300">{resources.current[key].toLocaleString()}</p>
            <p className="text-xs text-slate-400">+{resources.perHour[key]}/h</p>
          </article>
        ))}
      </section>

      <header className="flex items-center justify-between rounded-lg bg-slate-900 p-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">主城首页</h1>
          <p className="text-sm text-slate-300">
            欢迎回来，{player.profile.nickname}（{player.profile.faction.toUpperCase()}）
          </p>
        </div>
        <div className="text-right text-sm text-slate-300">
          <p>{user?.email}</p>
          <button
            className="mt-2 rounded bg-slate-700 px-3 py-1 text-xs hover:bg-slate-600"
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            退出登录
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg bg-slate-900 p-4">
          <h2 className="text-lg font-semibold">主城信息</h2>
          <ul className="mt-2 space-y-1 text-slate-300">
            <li>主城名称：{city.name}</li>
            <li>主城等级：Lv.{city.level}</li>
            <li>仓库等级：Lv.{city.warehouseLevel}（可扩展容量）</li>
            <li>队列数量：{city.queueSlots}</li>
            <li>主公：{city.owner.nickname}</li>
          </ul>
        </article>

        <article className="rounded-lg bg-slate-900 p-4">
          <h2 className="text-lg font-semibold">玩家概览</h2>
          <ul className="mt-2 space-y-1 text-slate-300">
            <li>阵营：{player.profile.faction.toUpperCase()}</li>
            <li>等级：Lv.{player.profile.level}</li>
            <li>战力：{player.profile.power}</li>
            <li>资源结算时间：{new Date(resources.lastCollectedAt).toLocaleString()}</li>
          </ul>
        </article>
      </section>

      <BuildingPanel
        buildings={buildings}
        queues={queues}
        onUpgrade={async (type) => {
          if (!token) {
            return;
          }

          try {
            await authApi.startUpgrade(token, type);
            await loadAllData(token);
          } catch (err) {
            if (err instanceof ApiError) {
              alert(err.message);
            } else {
              alert('升级失败');
            }
          }
        }}
      />
    </main>
  );
}
