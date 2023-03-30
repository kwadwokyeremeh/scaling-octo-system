import cn from 'classnames';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Avatar from '@/components/common/avatar';
import Link from '@/components/ui/link';
import { siteSettings } from '@/settings/site.settings';
import { useMeQuery } from '@/graphql/me.graphql';
import { useTranslation } from 'next-i18next';

export default function AuthorizedMenu() {
  const { data } = useMeQuery();
  const { t } = useTranslation('common');

  // Again, we're using framer-motion for the transition effect
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center focus:outline-none">
        <Avatar
          src={
            data?.me?.profile?.avatar?.thumbnail ??
            siteSettings?.avatar?.placeholder
          }
          alt="avatar"
        />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="ul"
          className="absolute end-0 w-48 mt-1 origin-top-end bg-white rounded shadow-md focus:outline-none"
        >
          <Menu.Item key={data?.me?.email}>
            <li
              className="w-full flex flex-col space-y-1 bg-[#00b791]
             text-white text-sm rounded-t px-4 py-3"
            >
              <span className="font-semibold capitalize">{data?.me?.name}</span>
              <span className="text-xs">{data?.me?.email}</span>
            </li>
          </Menu.Item>

          {siteSettings.authorizedLinks.map(({ href, labelTransKey }) => (
            <Menu.Item key={`${href}${labelTransKey}`}>
              {({ active }) => (
                <li className="border-b border-gray-100 cursor-pointer last:border-0">
                  <Link
                    href={href}
                    className={cn(
                      'block px-4 py-3 text-sm capitalize font-semibold transition duration-200 hover:text-accent',
                      active ? 'text-accent' : 'text-heading'
                    )}
                  >
                    {t(labelTransKey)}
                  </Link>
                </li>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
