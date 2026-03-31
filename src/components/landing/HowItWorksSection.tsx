import { CheckCircleOutlined, FormOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <UserAddOutlined className="text-2xl" />,
    title: 'Sign Up',
    desc: 'Create your account as a student, faculty, or admin in seconds.',
    step: '01',
    gradient: 'from-[#041A47] via-[#00639B] to-[#009BB0]',
    shadow: 'shadow-cyan-600/30',
  },
  {
    icon: <FormOutlined className="text-2xl" />,
    title: 'Submit & Track',
    desc: 'Report complaints or ask doubts. Track everything in real-time from your dashboard.',
    step: '02',
    gradient: 'from-violet-600 to-purple-500',
    shadow: 'shadow-violet-500/30',
  },
  {
    icon: <SearchOutlined className="text-2xl" />,
    title: 'Efficient Assignment',
    desc: 'Administrators assign complaints to faculty for quick resolution. Students get timely updates.',
    step: '03',
    gradient: 'from-orange-500 to-amber-400',
    shadow: 'shadow-orange-500/30',
  },
  {
    icon: <CheckCircleOutlined className="text-2xl" />,
    title: 'Resolved',
    desc: 'Get notified instantly when your complaint is resolved or your doubt is answered.',
    step: '04',
    gradient: 'from-green-600 to-emerald-500',
    shadow: 'shadow-green-500/30',
  },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24 px-6 bg-muted/20 dark:bg-muted/10">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-600/10 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
          How It Works
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Up and running in{' '}
          <span className="bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] bg-clip-text text-transparent">
            four steps
          </span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Get started in minutes and experience seamless campus management from day one.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative group"
          >
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-10 left-[calc(50%+2.5rem)] -right-3 h-px bg-linear-to-r from-border via-border to-transparent z-10" />
            )}

            <div className="relative bg-card border border-gray-500 rounded-3xl p-6 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-65">
              {/* Gradient icon */}
              <div className={`h-16 w-16 rounded-2xl bg-linear-to-br ${step.gradient} flex items-center justify-center text-white mx-auto mb-5 shadow-xl ${step.shadow} group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>

              <div className={`text-xs font-bold uppercase tracking-widest bg-linear-to-r ${step.gradient} bg-clip-text text-transparent mb-2`}>
                Step {step.step}
              </div>

              <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
