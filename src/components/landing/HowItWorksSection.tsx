import { CheckCircleOutlined, FormOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <UserAddOutlined className="text-3xl" />,
    title: 'Sign Up',
    desc: 'Create your account as a student, faculty member, or admin in seconds.',
    step: '01',
  },
  {
    icon: <FormOutlined className="text-3xl" />,
    title: 'Submit & Track',
    desc: 'Report complaints or ask doubts with our intuitive interface. Track everything in real-time.',
    step: '02',
  },
  {
    icon: <SearchOutlined className="text-3xl" />,
    title: 'Get Assigned',
    desc: 'Issues are automatically routed to the right department or faculty member.',
    step: '03',
  },
  {
    icon: <CheckCircleOutlined className="text-3xl" />,
    title: 'Resolved',
    desc: 'Receive notifications when your complaint is resolved or your doubt is answered.',
    step: '04',
  },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24 px-6 bg-linear-to-b from-background to-muted/30">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          How It Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get started in four simple steps and experience seamless campus management
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="relative"
          >
            {/* Connector line (except for last item) */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-linear-to-r from-blue-600/40 to-transparent" />
            )}

            <div className="relative bg-card border-1 border-gray-300 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {step.step}
              </div>

              <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-200/30 text-blue-600 dark:text-blue-400 mx-auto mb-4 mt-2">
                {step.icon}
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
