import { useEffect, useMemo, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Calendar as CalendarIcon } from "../../icons/calendar";
import { Cash as CashIcon } from "../../icons/cash";
import { ChartBar as ChartBarIcon } from "../../icons/chart-bar";
import { ChartPie as ChartPieIcon } from "../../icons/chart-pie";
import { ChatAlt2 as ChatAlt2Icon } from "../../icons/chat-alt2";
import { ClipboardList as ClipboardListIcon } from "../../icons/clipboard-list";
import { CreditCard as CreditCardIcon } from "../../icons/credit-card";
import { Home as HomeIcon } from "../../icons/home";
import SettingsIcon from "@mui/icons-material/Settings";
import { LockClosed as LockClosedIcon } from "../../icons/lock-closed";
import { Mail as MailIcon } from "../../icons/mail";
import { MailOpen as MailOpenIcon } from "../../icons/mail-open";
import { Newspaper as NewspaperIcon } from "../../icons/newspaper";
import { OfficeBuilding as OfficeBuildingIcon } from "../../icons/office-building";
import { ReceiptTax as ReceiptTaxIcon } from "../../icons/receipt-tax";
import { Selector as SelectorIcon } from "../../icons/selector";
import { Share as ShareIcon } from "../../icons/share";
import { ShoppingBag as ShoppingBagIcon } from "../../icons/shopping-bag";
import { ShoppingCart as ShoppingCartIcon } from "../../icons/shopping-cart";
import { Truck as TruckIcon } from "../../icons/truck";
import { UserCircle as UserCircleIcon } from "../../icons/user-circle";
import { Users as UsersIcon } from "../../icons/users";
import { XCircle as XCircleIcon } from "../../icons/x-circle";
import { Logo } from "../logo";
import { Scrollbar } from "../scrollbar";
import { DashboardSidebarSection } from "./dashboard-sidebar-section";
import { OrganizationPopover } from "./organization-popover";
import etlasname from "../etlas_logo_name.png";
import Image from "next/image";
import { LockClosed } from "../../icons/lock-closed";
import { DoorFront, SelectAll, Videocam } from "@mui/icons-material";
import { controllerApi } from "../../api/controllers";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import DescriptionIcon from "@mui/icons-material/Description";
import SyncUniconError from "./errors/sync-unicon-error";
import { serverDownCode } from "../../api/api-helpers";
import toast from "react-hot-toast";
import AuthenticationAddOnError from "./authentication-schedule/authentication-add-on-error";
import { useAuth } from "../../hooks/use-auth";
import { sendApi } from "../../api/api-helpers";

const getSections = (t) => [
  {
    title: t("General"),
    items: [
      {
        title: t("Overview"),
        path: "/dashboard",
        icon: <HomeIcon fontSize="small" />,
      },
      {
        title: t("Settings"),
        path: "/settings",
        icon: <SettingsIcon fontSize="small" />,
        children: [
          {
            title: "Account Management",
            path: "/dashboard/settings/account",
          },
          {
            title: "Notifications",
            path: "/dashboard/settings/notifications",
          },
        ],
      },
    ],
  },
  {
    title: t("Authentication"),
    items: [
      {
        title: t("Credentials"),
        path: "/dashboard/credentials/create",
        icon: <UsersIcon fontSize="small" />,
        children: [
          {
            title: "Add",
            path: "/dashboard/credentials/create",
          },
        ],
      },
    ],
  },
  {
    title: t("Devices"),
    items: [
      {
        title: t("Controllers"),
        path: "/dashboard/controllers/",
        icon: <SelectAll fontSize="small" />,
        children: [
          {
            title: "List",
            path: "/dashboard/controllers/",
          },
        ],
      },
      {
        title: t("Video Recorders"),
        path: "/dashboard/video-recorders/",
        icon: <Videocam fontSize="small" />,
        children: [
          {
            title: "List",
            path: "/dashboard/video-recorders/",
          },
          {
            title: t("Add"),
            path: "/dashboard/video-recorders/create",
          },
        ],
      },
    ],
  },

  {
    title: t("People"),
    items: [
      {
        title: t("Persons"),
        path: "/dashboard/persons",
        icon: <UsersIcon fontSize="small" />,
        children: [
          {
            title: t("List"),
            path: "/dashboard/persons",
          },
          {
            title: t("Add"),
            path: "/dashboard/persons/create",
          },
        ],
      },
      // {
      //   title: t('Organizations'),
      //   path: '/dashboard/jobs',
      //   icon: <OfficeBuildingIcon fontSize="small" />,
      //   children: [
      //     {
      //       title: t('List'),
      //       path: '/dashboard/jobs'
      //     },
      //     {
      //       title: t('Add'),
      //       path: '/dashboard/jobs/companies/1'
      //     }
      //   ]
      // },
      {
        title: t("Access Groups"),
        path: "/dashboard/access-groups",
        icon: <LockClosed fontSize="small" />,
        children: [
          {
            title: t("List"),
            path: "/dashboard/access-groups",
          },
          {
            title: t("Add"),
            path: "/dashboard/access-groups/create",
          },
        ],
      },
    ],
  },
  {
    title: t("Facility"),
    items: [
      {
        title: t("Entrances"),
        path: "/dashboard/entrances",
        icon: <DoorFront fontSize="small" />,
        children: [
          {
            title: t("List"),
            path: "/dashboard/entrances",
          },
          {
            title: t("Add"),
            path: "/dashboard/entrances/create",
          },
        ],
      },
    ],
  },
  {
    title: t("Events"),
    items: [
      {
        title: t("Management"),
        path: "/dashboard/events-management",
        icon: <NotificationImportantIcon fontSize="small" />,
        children: [
          {
            title: t("List"),
            path: "/dashboard/events-management",
          },
          {
            title: t("Add"),
            path: "/dashboard/events-management/create",
          },
        ],
      },
      {
        title: t("Logs"),
        path: "/dashboard/logs",
        icon: <DescriptionIcon fontSize="small" />,
        children: [
          {
            title: t("Event Log"),
            path: "/dashboard/logs/eventlog",
          },
          {
            title: t("Notification Log"),
            path: "/dashboard/logs/notificationlog",
          },
        ],
      },
    ],
  },

  // {
  //   title: t('Management'),
  //   items: [
  //     {
  //       title: t('Customers'),
  //       path: '/dashboard/customers',
  //       icon: <UsersIcon fontSize="small" />,
  //       children: [
  //         {
  //           title: t('List'),
  //           path: '/dashboard/customers'
  //         },
  //         {
  //           title: t('Details'),
  //           path: '/dashboard/customers/1'
  //         },
  //         {
  //           title: t('Edit'),
  //           path: '/dashboard/customers/1/edit'
  //         }
  //       ]
  //     },
  //     {
  //       title: t('Products'),
  //       path: '/dashboard/products',
  //       icon: <ShoppingBagIcon fontSize="small" />,
  //       children: [
  //         {
  //           title: t('List'),
  //           path: '/dashboard/products'
  //         },
  //         {
  //           title: t('Create'),
  //           path: '/dashboard/products/new'
  //         }
  //       ]
  //     },
  //     {
  //       title: t('Orders'),
  //       icon: <ShoppingCartIcon fontSize="small" />,
  //       path: '/dashboard/orders',
  //       children: [
  //         {
  //           title: t('List'),
  //           path: '/dashboard/orders'
  //         },
  //         {
  //           title: t('Details'),
  //           path: '/dashboard/orders/1'
  //         }
  //       ]
  //     },
  //     {
  //       title: t('Invoices'),
  //       path: '/dashboard/invoices',
  //       icon: <ReceiptTaxIcon fontSize="small" />,
  //       children: [
  //         {
  //           title: t('List'),
  //           path: '/dashboard/invoices'
  //         },
  //         {
  //           title: t('Details'),
  //           path: '/dashboard/invoices/1'
  //         }
  //       ]
  //     }
  //   ]
  // },
  // {
  //   title: t('Platforms'),
  //   items: [
  //     {
  //       title: t('Job Listings'),
  //       path: '/dashboard/jobs',
  //       icon: <OfficeBuildingIcon fontSize="small" />,
  //       children: [
  //         {
  //           title: t('Browse'),
  //           path: '/dashboard/jobs'
  //         },
  //         {
  //           title: t('Details'),
  //           path: '/dashboard/jobs/companies/1'
  //         },
  //         {
  //           title: t('Create'),
  //           path: '/dashboard/jobs/new'
  //         }
  //       ]
  //     },
  //     {
  //       title: t('Social Media'),
  //       path: '/dashboard/social',
  //       icon: <ShareIcon fontSize="small" />,
  //       children: [
  //         {
  //           title: t('Profile'),
  //           path: '/dashboard/social/profile'
  //         },
  //         {
  //           title: t('Feed'),
  //           path: '/dashboard/social/feed'
  //         }
  //       ]
  //     },
  //     {
  //       title: t('Blog'),
  //       path: '/blog',
  //       icon: <NewspaperIcon fontSize="small" />,
  //       children: [
  //         {
  //           title: t('Post List'),
  //           path: '/blog'
  //         },
  //         {
  //           title: t('Post Details'),
  //           path: '/blog/1'
  //         },
  //         {
  //           title: t('Post Create'),
  //           path: '/blog/new'
  //         }
  //       ]
  //     }
  //   ]
  // },
  // {
  //   title: t('Apps'),
  //   items: [
  //     {
  //       title: t('Kanban'),
  //       path: '/dashboard/kanban',
  //       icon: <ClipboardListIcon fontSize="small" />
  //     },
  //     {
  //       title: t('Mail'),
  //       path: '/dashboard/mail',
  //       icon: <MailIcon fontSize="small" />
  //     },
  //     {
  //       title: t('Chat'),
  //       path: '/dashboard/chat',
  //       icon: <ChatAlt2Icon fontSize="small" />
  //     },
  //     {
  //       title: t('Calendar'),
  //       path: '/dashboard/calendar',
  //       icon: <CalendarIcon fontSize="small" />
  //     }
  //   ]
  // },
  // {
  //   title: t('Pages'),
  //   items: [
  //     {
  //       title: t('Auth'),
  //       path: '/authentication',
  //       icon: <LockClosedIcon fontSize="small" />,
  //       children: [
  //         {
  //           title: t('Register'),
  //           path: '/authentication/register?disableGuard=true'
  //         },
  //         {
  //           title: t('Login'),
  //           path: '/authentication/login?disableGuard=true'
  //         }
  //       ]
  //     },
  //     {
  //       title: t('Pricing'),
  //       path: '/dashboard/pricing',
  //       icon: <CreditCardIcon fontSize="small" />
  //     },
  //     {
  //       title: t('Checkout'),
  //       path: '/checkout',
  //       icon: <CashIcon fontSize="small" />
  //     },
  //     {
  //       title: t('Contact'),
  //       path: '/contact',
  //       icon: <MailOpenIcon fontSize="small" />
  //     },
  //     {
  //       title: t('Error'),
  //       path: '/error',
  //       icon: <XCircleIcon fontSize="small" />,
  //       children: [
  //         {
  //           title: '401',
  //           path: '/401'
  //         },
  //         {
  //           title: '404',
  //           path: '/404'
  //         },
  //         {
  //           title: '500',
  //           path: '/500'
  //         }
  //       ]
  //     }
  //   ]
  // }
];

export const DashboardSidebar = (props) => {
  const { theaterMode, onClose, open } = props;
  const router = useRouter();
  const { t } = useTranslation();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"), {
    noSsr: true,
  });
  const [syncErrorMessages, setSyncErrorMessages] = useState([]);
  const [syncErrorOpen, setSyncErrorOpen] = useState(false);
  const { user } = useAuth();

  useEffect(
    () => {  
      const timer = setInterval(() => {
          refreshTokenChecker();
        }, 30 * 1000);
      return () => clearInterval(timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const refreshTokenChecker = async () => {
    try {
      const response = await sendApi("/api/auth/refreshTokenChecker", {
        method: "POST",
        body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") })
      },
        false);

      if (response.status === 404) {
        // Redirect to login page, use of router.push can further improve this feature for "stack" concept of returnURL
        window.location.href = "/authentication/login";
        // router.push({
        //   pathname: '/authentication/login',
        //   query: { returnUrl: router.asPath }
        // });
      }
    } catch (error) {
      console.error("Error here")
      console.error("Error:", error);
    }
  }

  const getSections = (t) => [
    {
      title: t("General"),
      items: [
        {
          title: t("Overview"),
          path: "/dashboard",
          icon: <HomeIcon fontSize="small" />,
        },
        {
          title: t("Settings"),
          path: "/settings",
          icon: <HomeIcon fontSize="small" />,
          children: [
            {
              title: "My Account",
              path: "/dashboard/settings/account",
            },
            ...(!user.authorities.some(
              (pair) => pair.authority === "ROLE_USER_ADMIN"
            )
              ? [
                  {
                    title: "User Management",
                    path: "/dashboard/settings/user-management",
                  },
                  {
                    title: "Notifications",
                    path: "/dashboard/settings/notifications",
                  },
                  {
                    title: "Data Management",
                    path: "/dashboard/settings/data-management",
                  }
                ]
              : []),
          ],
        },
      ],
    },
    {
      title: t("Authentication"),
      items: [
        {
          title: t("Credentials"),
          path: "/dashboard/credentials/create",
          icon: <UsersIcon fontSize="small" />,
          children: [
            {
              title: "Add",
              path: "/dashboard/credentials/create",
            },
          ],
        },
      ],
    },
    {
      // check whether the logged in user has this role if yes then add this item in navbar
      title: t("Devices"),
      items: [
        ...(user.authorities.some(
          (pair) =>
            pair.authority === "ROLE_SYSTEM_ADMIN" ||
            pair.authority === "ROLE_TECH_ADMIN"
        )
          ? [
              {
                title: t("Controllers"),
                path: "/dashboard/controllers/",
                icon: <SelectAll fontSize="small" />,
                children: [
                  {
                    title: "List",
                    path: "/dashboard/controllers/",
                  },
                ],
              },
              {
                title: t("Video Recorders"),
                path: "/dashboard/video-recorders/",
                icon: <Videocam fontSize="small" />,
                children: [
                  {
                    title: "List",
                    path: "/dashboard/video-recorders/",
                  },
                  {
                    title: t("Add"),
                    path: "/dashboard/video-recorders/create",
                  },
                ],
              },
            ]
          : []),
      ],
    },

    {
      title: t("People"),
      items: [
        {
          title: t("Persons"),
          path: "/dashboard/persons",
          icon: <UsersIcon fontSize="small" />,
          children: [
            {
              title: t("List"),
              path: "/dashboard/persons",
            },
            {
              title: t("Add"),
              path: "/dashboard/persons/create",
            },
          ],
        },
        // {
        //   title: t('Organizations'),
        //   path: '/dashboard/jobs',
        //   icon: <OfficeBuildingIcon fontSize="small" />,
        //   children: [
        //     {
        //       title: t('List'),
        //       path: '/dashboard/jobs'
        //     },
        //     {
        //       title: t('Add'),
        //       path: '/dashboard/jobs/companies/1'
        //     }
        //   ]
        // },
        {
          title: t("Access Groups"),
          path: "/dashboard/access-groups",
          icon: <LockClosed fontSize="small" />,
          children: [
            {
              title: t("List"),
              path: "/dashboard/access-groups",
            },
            {
              title: t("Add"),
              path: "/dashboard/access-groups/create",
            },
          ],
        },
      ],
    },
    {
      title: t("Facility"),
      items: [
        {
          title: t("Entrances"),
          path: "/dashboard/entrances",
          icon: <DoorFront fontSize="small" />,
          children: [
            {
              title: t("List"),
              path: "/dashboard/entrances",
            },
            {
              title: t("Add"),
              path: "/dashboard/entrances/create",
            },
          ],
        },
      ],
    },
    {
      title: t("Events"),
      items: [
        {
          title: t("Management"),
          path: "/dashboard/events-management",
          icon: <NotificationImportantIcon fontSize="small" />,
          children: [
            {
              title: t("List"),
              path: "/dashboard/events-management",
            },
            {
              title: t("Add"),
              path: "/dashboard/events-management/create",
            },
          ],
        },
        {
          title: t("Logs"),
          path: "/dashboard/logs",
          icon: <DescriptionIcon fontSize="small" />,
          children: [
            {
              title: t("Event Log"),
              path: "/dashboard/logs/eventlog",
            },
            {
              title: t("Notification Log"),
              path: "/dashboard/logs/notificationlog",
            },
          ],
        },
      ],
    },

    // {
    //   title: t('Management'),
    //   items: [
    //     {
    //       title: t('Customers'),
    //       path: '/dashboard/customers',
    //       icon: <UsersIcon fontSize="small" />,
    //       children: [
    //         {
    //           title: t('List'),
    //           path: '/dashboard/customers'
    //         },
    //         {
    //           title: t('Details'),
    //           path: '/dashboard/customers/1'
    //         },
    //         {
    //           title: t('Edit'),
    //           path: '/dashboard/customers/1/edit'
    //         }
    //       ]
    //     },
    //     {
    //       title: t('Products'),
    //       path: '/dashboard/products',
    //       icon: <ShoppingBagIcon fontSize="small" />,
    //       children: [
    //         {
    //           title: t('List'),
    //           path: '/dashboard/products'
    //         },
    //         {
    //           title: t('Create'),
    //           path: '/dashboard/products/new'
    //         }
    //       ]
    //     },
    //     {
    //       title: t('Orders'),
    //       icon: <ShoppingCartIcon fontSize="small" />,
    //       path: '/dashboard/orders',
    //       children: [
    //         {
    //           title: t('List'),
    //           path: '/dashboard/orders'
    //         },
    //         {
    //           title: t('Details'),
    //           path: '/dashboard/orders/1'
    //         }
    //       ]
    //     },
    //     {
    //       title: t('Invoices'),
    //       path: '/dashboard/invoices',
    //       icon: <ReceiptTaxIcon fontSize="small" />,
    //       children: [
    //         {
    //           title: t('List'),
    //           path: '/dashboard/invoices'
    //         },
    //         {
    //           title: t('Details'),
    //           path: '/dashboard/invoices/1'
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   title: t('Platforms'),
    //   items: [
    //     {
    //       title: t('Job Listings'),
    //       path: '/dashboard/jobs',
    //       icon: <OfficeBuildingIcon fontSize="small" />,
    //       children: [
    //         {
    //           title: t('Browse'),
    //           path: '/dashboard/jobs'
    //         },
    //         {
    //           title: t('Details'),
    //           path: '/dashboard/jobs/companies/1'
    //         },
    //         {
    //           title: t('Create'),
    //           path: '/dashboard/jobs/new'
    //         }
    //       ]
    //     },
    //     {
    //       title: t('Social Media'),
    //       path: '/dashboard/social',
    //       icon: <ShareIcon fontSize="small" />,
    //       children: [
    //         {
    //           title: t('Profile'),
    //           path: '/dashboard/social/profile'
    //         },
    //         {
    //           title: t('Feed'),
    //           path: '/dashboard/social/feed'
    //         }
    //       ]
    //     },
    //     {
    //       title: t('Blog'),
    //       path: '/blog',
    //       icon: <NewspaperIcon fontSize="small" />,
    //       children: [
    //         {
    //           title: t('Post List'),
    //           path: '/blog'
    //         },
    //         {
    //           title: t('Post Details'),
    //           path: '/blog/1'
    //         },
    //         {
    //           title: t('Post Create'),
    //           path: '/blog/new'
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   title: t('Apps'),
    //   items: [
    //     {
    //       title: t('Kanban'),
    //       path: '/dashboard/kanban',
    //       icon: <ClipboardListIcon fontSize="small" />
    //     },
    //     {
    //       title: t('Mail'),
    //       path: '/dashboard/mail',
    //       icon: <MailIcon fontSize="small" />
    //     },
    //     {
    //       title: t('Chat'),
    //       path: '/dashboard/chat',
    //       icon: <ChatAlt2Icon fontSize="small" />
    //     },
    //     {
    //       title: t('Calendar'),
    //       path: '/dashboard/calendar',
    //       icon: <CalendarIcon fontSize="small" />
    //     }
    //   ]
    // },
    // {
    //   title: t('Pages'),
    //   items: [
    //     {
    //       title: t('Auth'),
    //       path: '/authentication',
    //       icon: <LockClosedIcon fontSize="small" />,
    //       children: [
    //         {
    //           title: t('Register'),
    //           path: '/authentication/register?disableGuard=true'
    //         },
    //         {
    //           title: t('Login'),
    //           path: '/authentication/login?disableGuard=true'
    //         }
    //       ]
    //     },
    //     {
    //       title: t('Pricing'),
    //       path: '/dashboard/pricing',
    //       icon: <CreditCardIcon fontSize="small" />
    //     },
    //     {
    //       title: t('Checkout'),
    //       path: '/checkout',
    //       icon: <CashIcon fontSize="small" />
    //     },
    //     {
    //       title: t('Contact'),
    //       path: '/contact',
    //       icon: <MailOpenIcon fontSize="small" />
    //     },
    //     {
    //       title: t('Error'),
    //       path: '/error',
    //       icon: <XCircleIcon fontSize="small" />,
    //       children: [
    //         {
    //           title: '401',
    //           path: '/401'
    //         },
    //         {
    //           title: '404',
    //           path: '/404'
    //         },
    //         {
    //           title: '500',
    //           path: '/500'
    //         }
    //       ]
    //     }
    //   ]
    // }
  ];

  const sections = useMemo(() => getSections(t), [t]);
  const organizationsRef = useRef(null);
  const [openOrganizationsPopover, setOpenOrganizationsPopover] =
    useState(false);

  const handleOpenSyncError = () => {
    setSyncErrorOpen(true);
  };
  const handleCloseSyncError = () => {
    setSyncErrorOpen(false);
    setSyncErrorMessages([]);
  };

  const handleSyncErrorMessages = (res) => {
    setSyncErrorMessages(res);
  };

  const handlePathChange = () => {
    if (!router.isReady) {
      return;
    }

    if (open) {
      onClose?.();
    }
  };

  useEffect(
    handlePathChange,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady, router.asPath]
  );

  const handleOpenOrganizationsPopover = () => {
    setOpenOrganizationsPopover(true);
  };

  const handleCloseOrganizationsPopover = () => {
    setOpenOrganizationsPopover(false);
  };

  const content = (
    <>
      <Scrollbar
        sx={{
          height: "100%",
          "& .simplebar-content": {
            height: "100%",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <SyncUniconError
            errorMessages={syncErrorMessages}
            open={syncErrorOpen}
            handleClose={handleCloseSyncError}
          />
          <div>
            <Box sx={{ p: 3 }}>
              <NextLink href="/dashboard" passHref>
                <a>
                  <Logo
                    sx={{
                      height: 40,
                      width: 40,
                    }}
                  />
                </a>
              </NextLink>
              <NextLink href="/dashboard" passHref>
                <a>
                  <Image src={etlasname} />
                </a>
              </NextLink>
            </Box>
            {/* <Box sx={{ px: 2 }}>
              <Box
                onClick={handleOpenOrganizationsPopover}
                ref={organizationsRef}
                sx={{
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  px: 3,
                  py: '11px',
                  borderRadius: 1
                }}
              >
                <div>
                  <Typography
                    color="inherit"
                    variant="subtitle1"
                  >
                    Acme Inc
                  </Typography>
                  <Typography
                    color="neutral.400"
                    variant="body2"
                  >
                    {t('Your tier')}
                    {' '}
                    : Premium
                  </Typography>
                </div>
                <SelectorIcon
                  sx={{
                    color: 'neutral.500',
                    width: 14,
                    height: 14
                  }}
                />
              </Box>
            </Box> */}
          </div>

          <Box sx={{ p: 2 }}>
            <Button
              onClick={() => {
                controllerApi
                  .uniconUpdater()
                  .then((res) => {
                    if (res.status == 200) {
                      window.location.reload(true);
                      toast.success("Synced successfully", { duration: 2000 });
                    } else {
                      if (res.status == serverDownCode) {
                        toast.error(
                          "Synced unsuccessfully due to server is down",
                          { duration: 2000 }
                        );
                      } else {
                        const array = [];
                        res.json().then((data) => {
                          Object.entries(data).map(([key, value]) => {
                            array.push([key, value]);
                          });
                          handleSyncErrorMessages(array);
                        });
                        console.log(array, "errorArr");
                        console.log(syncErrorOpen, "syncOpen");
                        handleOpenSyncError();
                        toast.error("Synced unsuccessfully");
                      }
                    }
                  })
                  .catch((err) => {
                    toast.error("Synced unsuccessfully", { duration: 2000 });
                  });
              }}
              color="info"
              component="a"
              fullWidth
              sx={{ mt: 2 }}
              variant="contained"
            >
              {t("Sync Unicons")}
            </Button>
          </Box>

          <Divider
            sx={{
              borderColor: "#2D3748",
              my: 3,
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            {sections.map((section) => (
              <DashboardSidebarSection
                key={section.title}
                path={router.asPath}
                sx={{
                  mt: 2,
                  "& + &": {
                    mt: 2,
                  },
                }}
                {...section}
              />
            ))}
          </Box>
          <Divider
            sx={{
              borderColor: "#2D3748", // dark divider
            }}
          />
          <Box sx={{ p: 2 }}>
          <Typography color="neutral.500" variant="body2">
              {t("v1.0.0")}
            </Typography>
            <Typography color="neutral.100" variant="subtitle2">
              {t("Need Help?")}
            </Typography>
            <Typography color="neutral.500" variant="body2">
              {t("Check our docs")}
            </Typography>
            <NextLink href="/docs/welcome" passHref>
              <Button
                color="secondary"
                component="a"
                fullWidth
                sx={{ mt: 2 }}
                variant="contained"
              >
                {t("Documentation")}
              </Button>
            </NextLink>
          </Box>
        </Box>
      </Scrollbar>
      <OrganizationPopover
        anchorEl={organizationsRef.current}
        onClose={handleCloseOrganizationsPopover}
        open={openOrganizationsPopover}
      />
    </>
  );

  if (lgUp) {
    return (
      <Drawer
        open={!theaterMode}
        anchor="left"
        PaperProps={{
          sx: {
            backgroundColor: "primary.dark",
            borderRightColor: "divider",
            borderRightStyle: "solid",
            borderRightWidth: (theme) =>
              theme.palette.mode === "dark" ? 1 : 0,
            color: "#FFFFFF",
            width: 280,
          },
        }}
        variant={theaterMode ? "persistent" : "permanent"}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: "primary.dark",
          color: "#FFFFFF",
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
