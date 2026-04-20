import logo from '@/assets/logo.jpeg';
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Highlight = {
  title: string;
  description?: string;
};

type AuthSplitLayoutProps = {
  showcaseTitle: ReactNode;
  showcaseDescription: string;
  showcaseEyebrow?: string;
  highlights: Highlight[];
  formTitle: string;
  formDescription: string;
  formEyebrow?: string;
  backHref?: string;
  footer?: ReactNode;
  children: ReactNode;
};

const brand = (
  <div className="flex items-center gap-3">
    <div className="h-11 w-11 shrink-0 rounded-2xl border border-white/15 bg-white/10 p-1.5 shadow-lg shadow-cyan-950/20 backdrop-blur-sm">
      <img src={logo} alt="CampusCure" className="h-full w-full rounded-xl object-contain" />
    </div>
    <div className="flex flex-col">
      <span className="text-xl font-semibold tracking-tight">
       <span className="text-sky-300">Campus</span>
        <span className="text-cyan-100">Cure</span>
      </span>
       <span className="text-[11px] uppercase tracking-[0.32em] text-cyan-100/55">Campus Operations</span>
    </div>
  </div>
);

const AuthSplitLayout = ({
  showcaseTitle,
  showcaseDescription,
  highlights,
  formTitle,
  formDescription,
  formEyebrow,
  backHref = '/',
  footer,
  children,
}: AuthSplitLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[minmax(420px,560px)_1fr]">
      <aside className="relative hidden overflow-hidden lg:flex lg:min-h-screen lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1cc8d4_0%,rgba(28,200,212,0.16)_26%,transparent_54%),linear-gradient(165deg,#04122f_8%,#0a2f61_44%,#0a7c9b_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[64px_64px] opacity-20" />
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between px-12 py-10">
          <div className="space-y-12">
            {brand}

            <div className="space-y-7">
              <div>
                <h1 className="max-w-md text-4xl pb-2 font-semibold leading-[1.02] tracking-tight text-white">
                  {showcaseTitle}
                </h1>
               <p className="max-w-xl text-base leading-8 text-cyan-50/76">{showcaseDescription}</p>
              </div>

              <div className="space-y-4 pt-2">
                {highlights.map((highlight) => (
                  <div
                    key={highlight.title}
                   className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/12 text-cyan-200 ring-1 ring-inset ring-cyan-200/18">
                      <CheckOutlined style={{ fontSize: 12 }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{highlight.title}</p>
                      {highlight.description ? (
                        <p className="mt-1 text-sm leading-6 text-cyan-50/62">{highlight.description}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <section className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(12,135,160,0.12),transparent_30%),linear-gradient(180deg,#f8fcff_0%,#eef6fb_100%)]">
        <div className="absolute inset-0 hidden lg:block">
          <div className="absolute -right-20 -top-7.5 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-[12%] h-60 w-60 rounded-full bg-blue-200/20 blur-3xl" />
        </div>

        <div className="relative z-10 sm:px-8 lg:px-10 lg:pt-8">
          <Link
            to={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition-colors hover:border-cyan-300/60 hover:text-slate-950"
          >
            <ArrowLeftOutlined style={{ fontSize: 12 }} />
            Back to home
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-8 pt-2 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-xl"
          >
            <div className="rounded-4xl border border-white/70 bg-white/88 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8 lg:px-10 lg:py-6">
              <div className="space-y-8">
                <div className="lg:hidden">{brand}</div>

                <div className="space-y-3">
                  {formEyebrow ? (
                    <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      {formEyebrow}
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{formTitle}</h2>
                    <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-[15px]">{formDescription}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {children}
                  {footer}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AuthSplitLayout;
