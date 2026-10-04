/**
 * English / हिंदी toggle (CC-71). Each option is written in its own script,
 * so someone who cannot read the current language can still find theirs.
 */

import { Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, type LanguageCode, setLanguage } from '@/i18n';

export const LanguageSwitcher = ({ size = 'small' }: { size?: 'small' | 'middle' }) => {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? 'en') as LanguageCode;

  return (
    <Segmented
      size={size}
      aria-label={t('common.language')}
      value={current}
      onChange={(value) => void setLanguage(value as LanguageCode)}
      options={LANGUAGES.map((lang) => ({ value: lang.code, label: <span lang={lang.code}>{lang.label}</span> }))}
    />
  );
};

export default LanguageSwitcher;
