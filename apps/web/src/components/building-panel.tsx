'use client';

import { BuildingItem, BuildingQueueItem, BuildingType } from '../lib/auth-api';

const BUILDING_LABELS: Record<BuildingType, string> = {
  main_hall: '主城府',
  farm: '农田',
  lumber_mill: '伐木场',
  iron_mine: '铁矿场',
  stone_quarry: '石料场',
  warehouse: '仓库',
  barracks: '兵营',
  institute: '研究所'
};

interface BuildingPanelProps {
  buildings: BuildingItem[];
  queues: BuildingQueueItem[];
  onUpgrade: (type: BuildingType) => Promise<void>;
}

export function BuildingPanel({ buildings, queues, onUpgrade }: BuildingPanelProps) {
  const pendingMap = new Map(
    queues.filter((item) => item.status === 'pending').map((item) => [item.buildingType, item])
  );

  return (
    <section className="rounded-lg bg-slate-900 p-4">
      <h2 className="text-lg font-semibold">建筑列表</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {buildings.map((building) => {
          const queue = pendingMap.get(building.type);
          return (
            <article key={building.id} className="rounded border border-slate-700 bg-slate-800 p-3">
              <header className="flex items-center justify-between">
                <h3 className="font-semibold text-amber-300">{BUILDING_LABELS[building.type]}</h3>
                <span className="text-sm text-slate-300">Lv.{building.level}</span>
              </header>

              {queue ? (
                <p className="mt-2 text-sm text-blue-300">升级中，剩余 {queue.remainingSeconds}s</p>
              ) : (
                <p className="mt-2 text-sm text-slate-300">状态：空闲</p>
              )}

              {building.nextUpgrade ? (
                <div className="mt-2 text-xs text-slate-400">
                  <p>升级到 Lv.{building.nextUpgrade.toLevel}</p>
                  <p>
                    消耗 粮{building.nextUpgrade.cost.food} 木{building.nextUpgrade.cost.wood} 铁
                    {building.nextUpgrade.cost.iron} 石{building.nextUpgrade.cost.stone} 金
                    {building.nextUpgrade.cost.gold}
                  </p>
                  <p>耗时 {building.nextUpgrade.durationSeconds}s</p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400">已满级</p>
              )}

              <button
                className="mt-3 w-full rounded bg-amber-500 py-1.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
                disabled={!building.nextUpgrade || building.isUpgrading}
                onClick={() => onUpgrade(building.type)}
              >
                {building.isUpgrading ? '升级中' : '升级'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
