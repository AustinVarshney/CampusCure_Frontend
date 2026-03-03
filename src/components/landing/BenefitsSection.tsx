import { BookOutlined, DeploymentUnitOutlined, TeamOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: <TeamOutlined className="text-3xl" />,
    title: 'For Students',
    bgColor: 'bg-blue-50 dark:bg-blue-90/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    items: [
      'Submit and track complaints effortlessly',
      'Get quick answers from the doubt community',
      'Stay informed with real-time notifications',
      'Build knowledge through peer collaboration',
    ],
  },
  {
    icon: <BookOutlined className="text-3xl" />,
    title: 'For Faculty',
    bgColor: 'bg-purple-50 dark:bg-purple-90/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    items: [
      'Verify and guide student discussions',
      'Monitor campus issues efficiently',
      'Access analytics on student engagement',
      'Streamline administrative workflows',
    ],
  },
  {
    icon: <DeploymentUnitOutlined className="text-3xl" />,
    title: 'For Administrators',
    bgColor: 'bg-orange-50 dark:bg-orange-90/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    items: [
      'Centralized complaint management system',
      'Data-driven insights and reporting',
      'Automated assignment and routing',
      'Improve campus services strategically',
    ],
  },
];

const BenefitsSection = () => (
  <section id="benefits" className="py-24 px-6 bg-muted/20">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Why Choose CampusCure?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tailored solutions for every member of your campus community
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {benefits.map((benefit, i) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            whileHover={{ y: -8 }}
            className="relative group"
          >
            <div className="relative bg-card border-1 border-gray-300rounded-2xl p-8 h-full overflow-hidden">
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 ${benefit.bgColor} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${benefit.bgColor} ${benefit.iconColor} mb-5`}>
                  {benefit.icon}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-4">{benefit.title}</h3>

                <ul className="space-y-3">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400 mt-1 shrink-0">✓</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
