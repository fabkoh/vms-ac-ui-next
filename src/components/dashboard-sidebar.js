{
    title: t('Events'),
    items: [
      {
        title: t('Management'),
        path: '/dashboard/persons',
        icon: <NotificationImportantIcon fontSize="small" />,
        children: [
          {
            title: t('Add'),
            path: '/dashboard/persons/create'
          }
        ]
      },
      {
        title: t('Logs'),
        path: '/dashboard/logs',
        icon: <DescriptionIcon fontSize="small" />,
        children: [
          {
            title: t('List'),
            path: '/dashboard/logs'
          }
        ]
      },
    ]
  },