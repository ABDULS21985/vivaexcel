"use client";

import { Terminal, Download, Rocket } from "lucide-react";
import { CopyCodeButton } from "./copy-code-button";

interface SetupGuideProps {
  githubRepoUrl?: string;
  title: string;
  packageManager?: string;
}

const STEP_ICONS = [Terminal, Download, Rocket] as const;

const STEP_COLORS = [
  "from-[#1E4DB7] to-[#143A8F]",
  "from-[#F59A23] to-[#E86A1D]",
  "from-emerald-500 to-emerald-600",
];

export function SetupGuide({ githubRepoUrl, title, packageManager }: SetupGuideProps) {
  const repoName = githubRepoUrl
    ? githubRepoUrl.replace(/\.git$/, "").split("/").pop() || "template"
    : "template";

  const installCmd =
    packageManager === "yarn"
      ? "yarn install"
      : packageManager === "pnpm"
        ? "pnpm install"
        : packageManager === "bun"
          ? "bun install"
          : "npm install";

  const devCmd =
    packageManager === "yarn"
      ? "yarn dev"
      : packageManager === "pnpm"
        ? "pnpm dev"
        : packageManager === "bun"
          ? "bun dev"
          : "npm run dev";

  const cloneCmd = githubRepoUrl
    ? `git clone ${githubRepoUrl}`
    : `git clone https://github.com/your-org/${repoName}.git`;

  const steps = [
    {
      number: 1,
      title: "Clone the Repository",
      description: "Get the source code on your machine",
      code: `${cloneCmd}\ncd ${repoName}`,
    },
    {
      number: 2,
      title: "Install Dependencies",
      description: "Install all required packages",
      code: installCmd,
    },
    {
      number: 3,
      title: "Start Development",
      description: "Launch the dev server and start building",
      code: devCmd,
    },
  ];

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-6 top-12 bottom-12 hidden w-0.5 bg-gradient-to-b from-[#1E4DB7] via-[#F59A23] to-emerald-500 lg:block" />

      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[index];
          return (
            <div key={step.number} className="relative flex gap-5">
              {/* Step number circle */}
              <div className="relative z-10 hidden shrink-0 lg:block">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${STEP_COLORS[index]} shadow-lg`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
                <div className="mb-1 flex items-center gap-3">
                  {/* Mobile step circle */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${STEP_COLORS[index]} lg:hidden`}
                  >
                    <span className="text-xs font-bold text-white">{step.number}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Step {step.number}: {step.title}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Code block */}
                <div className="mt-3 overflow-hidden rounded-lg bg-neutral-900 dark:bg-neutral-950">
                  <div className="flex items-center justify-between border-b border-neutral-700/50 px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <CopyCodeButton text={step.code} />
                  </div>
                  <div className="p-4">
                    <pre className="overflow-x-auto text-sm leading-relaxed">
                      <code className="font-mono text-emerald-400">{step.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
