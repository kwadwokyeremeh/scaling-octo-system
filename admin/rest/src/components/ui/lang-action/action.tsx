import ActionButtons from '@/components/common/action-buttons';
import { Config } from '@/config';
import LanguageAction from './language-switcher';

export type LanguageSwitcherProps = {
  record: any;
  slug: string;
  deleteModalView?: string | any;
  routes: any;
  className?: string | undefined;
};

export default function LanguageSwitcher({
  record,
  slug,
  deleteModalView,
  routes,
  className,
}: LanguageSwitcherProps) {
  const { enableMultiLang } = Config;
  return (
    <>
      {enableMultiLang ? (
        <LanguageAction
          slug={slug}
          record={record}
          deleteModalView={deleteModalView}
          routes={routes}
          className={className}
        />
      ) : (
        <ActionButtons
          id={record?.id}
          editUrl={routes.editWithoutLang(slug)}
          deleteModalView={deleteModalView}
        />
      )}
    </>
  );
}
