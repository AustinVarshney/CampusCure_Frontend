import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useState } from 'react';

const faqs = [
  {
    question: 'Who can use CampusCure?',
    answer: 'CampusCure is designed for students, faculty members, and administrators in educational institutions. Each user type has specific features tailored to their needs.',
  },
  {
    question: 'How do I track my complaint status?',
    answer: "Once you submit a complaint, you can track its progress from your dashboard. View detailed updates and status changes throughout the resolution process.",
  },
  {
    question: 'Is there a mobile app available?',
    answer: "CampusCure is currently a responsive web application that works seamlessly on all devices — desktop, tablet, and mobile. A dedicated mobile app is planned for future release.",
  },
  {
    question: 'How does the doubt community work?',
    answer: 'Students can post academic doubts which can be answered by peers and verified by faculty members. This creates a collaborative learning environment with quality-assured answers.',
  },
  {
    question: 'What types of complaints can I submit?',
    answer: 'You can submit various types of complaints including infrastructure issues like projectors, fans, lights, smart boards, and seating. Our smart routing system automatically assigns them to faculty with relevant expertise.',
  },
  {
    question: 'How secure is my data?',
    answer: 'We take security seriously. All data is encrypted and we follow industry-standard security practices. User information is protected and only accessible to authorized personnel.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#00639B]/10 text-[#00639B] dark:text-[#009BB0] text-xs font-semibold uppercase tracking-wider mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked{' '}
            <span className="bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-muted-foreground">
            Find quick answers to common questions about CampusCure.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-accent/40 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-foreground pr-4 text-sm sm:text-base">{faq.question}</span>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                  openIndex === index
                    ? 'bg-linear-to-br from-[#041A47] via-[#00639B] to-[#009BB0] text-white'
                    : 'bg-accent text-muted-foreground'
                }`}>
                  {openIndex === index
                    ? <MinusOutlined style={{ fontSize: 10 }} />
                    : <PlusOutlined style={{ fontSize: 10 }} />
                  }
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{ height: openIndex === index ? 'auto' : 0, opacity: openIndex === index ? 1 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
