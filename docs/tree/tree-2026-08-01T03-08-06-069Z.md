# Project Tree

Generated on: 2026-08-01T03:08:06.066Z

```
EliteStay
├── .github
│   └── workflows
│       ├── ci.yml
│       └── playwright.yml
├── .husky
│   ├── _
│   │   ├── .gitignore
│   │   ├── applypatch-msg
│   │   ├── commit-msg
│   │   ├── h
│   │   ├── husky.sh
│   │   ├── post-applypatch
│   │   ├── post-checkout
│   │   ├── post-commit
│   │   ├── post-merge
│   │   ├── post-rewrite
│   │   ├── pre-applypatch
│   │   ├── pre-auto-gc
│   │   ├── pre-commit
│   │   ├── pre-merge-commit
│   │   ├── pre-push
│   │   ├── pre-rebase
│   │   └── prepare-commit-msg
│   └── pre-commit
├── public
│   ├── images
│   │   └── placeholders
│   │       ├── listing-1.png
│   │       └── location-1.png
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts
│   └── generate-tree.js
├── src
│   ├── __tests__
│   │   ├── auth-rls.test.ts
│   │   ├── health.test.tsx
│   │   ├── setup.ts
│   │   └── utils.test.ts
│   ├── app
│   │   ├── (auth)
│   │   │   ├── callback
│   │   │   │   └── route.ts
│   │   │   ├── forgot-password
│   │   │   │   └── page.tsx
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password
│   │   │   │   └── page.tsx
│   │   │   ├── signup
│   │   │   │   └── page.tsx
│   │   │   ├── verify-email
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (main)
│   │   │   ├── s
│   │   │   │   └── page.tsx
│   │   │   ├── page.module.css
│   │   │   └── page.tsx
│   │   ├── api
│   │   │   └── listings
│   │   │       └── [id]
│   │   │           └── ical
│   │   │               └── route.ts
│   │   ├── host
│   │   │   ├── bookings
│   │   │   │   └── page.tsx
│   │   │   ├── calendar
│   │   │   │   └── page.tsx
│   │   │   ├── listings
│   │   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   ├── stays
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── stay
│   │   │   └── [publicId]
│   │   │       └── page.tsx
│   │   ├── users
│   │   │   ├── inbox
│   │   │   │   ├── [conversationId]
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── messages
│   │   │   │   └── [id]
│   │   │   │       └── page.tsx
│   │   │   ├── notifications
│   │   │   │   └── page.tsx
│   │   │   ├── profile
│   │   │   │   └── page.tsx
│   │   │   ├── settings
│   │   │   │   ├── communication
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── data
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── hosting
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── notifications
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── privacy
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── security
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components
│   │   ├── header
│   │   │   ├── GlobalSearch
│   │   │   │   ├── GlobalSearch.tsx
│   │   │   │   ├── SearchButton.tsx
│   │   │   │   ├── SearchContext.tsx
│   │   │   │   ├── SearchDates.tsx
│   │   │   │   ├── SearchModal.tsx
│   │   │   │   ├── SearchOverlay.tsx
│   │   │   │   ├── SearchSection.tsx
│   │   │   │   ├── SearchShell.tsx
│   │   │   │   ├── SearchType.tsx
│   │   │   │   ├── SearchWhere.tsx
│   │   │   │   └── types.ts
│   │   │   ├── Header.tsx
│   │   │   ├── HeaderLayout.tsx
│   │   │   ├── HeaderWrapper.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── useHeaderState.ts
│   │   ├── layout
│   │   │   ├── Container.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── Page.tsx
│   │   │   ├── Section.tsx
│   │   │   └── Stack.tsx
│   │   ├── map
│   │   │   └── MapboxProvider.tsx
│   │   ├── navigation
│   │   │   ├── Footer.tsx
│   │   │   ├── FooterWrapper.tsx
│   │   │   ├── Logo.tsx
│   │   │   └── UserMenu.tsx
│   │   └── ui
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── command.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── switch.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   ├── config
│   │   ├── design.ts
│   │   └── env.ts
│   ├── features
│   │   ├── auth
│   │   │   ├── actions
│   │   │   │   ├── auth-actions.ts
│   │   │   │   └── profile-actions.ts
│   │   │   ├── components
│   │   │   │   ├── AuthInfoPanel.tsx
│   │   │   │   └── AvatarUploader.tsx
│   │   │   ├── schemas
│   │   │   │   ├── auth-schemas.ts
│   │   │   │   └── profile-schemas.ts
│   │   │   ├── server
│   │   │   │   └── auth-helpers.ts
│   │   │   └── types
│   │   │       └── errors.ts
│   │   ├── bookings
│   │   │   ├── __tests__
│   │   │   │   └── pricing.test.ts
│   │   │   ├── actions
│   │   │   │   └── bookingActions.ts
│   │   │   ├── api
│   │   │   │   └── queries.ts
│   │   │   ├── components
│   │   │   │   ├── BookingRequestList.tsx
│   │   │   │   ├── BookingWidget.tsx
│   │   │   │   └── CalendarView.tsx
│   │   │   └── utils
│   │   │       ├── pricing.ts
│   │   │       ├── transitions.test.ts
│   │   │       └── transitions.ts
│   │   ├── dashboard
│   │   │   └── components
│   │   │       ├── ContentPanel.tsx
│   │   │       ├── DashboardHeader.tsx
│   │   │       ├── DashboardShell.tsx
│   │   │       ├── MainPanel.tsx
│   │   │       ├── PageCanvas.tsx
│   │   │       └── SubPanel.tsx
│   │   ├── home
│   │   │   ├── api
│   │   │   │   └── queries.ts
│   │   │   ├── components
│   │   │   │   ├── Categories.tsx
│   │   │   │   ├── HomeSection.tsx
│   │   │   │   ├── MapPreview.tsx
│   │   │   │   └── PopularLocations.tsx
│   │   │   ├── config
│   │   │   │   └── sections.ts
│   │   │   └── constants.ts
│   │   ├── host
│   │   │   ├── actions
│   │   │   │   ├── image-actions.ts
│   │   │   │   └── listing-actions.ts
│   │   │   └── components
│   │   │       ├── AccommodationForm.tsx
│   │   │       ├── AvailabilitySettings.tsx
│   │   │       ├── CreateListingButton.tsx
│   │   │       ├── FeaturesForm.tsx
│   │   │       ├── ImagesForm.tsx
│   │   │       ├── LocationForm.tsx
│   │   │       ├── PricingForm.tsx
│   │   │       └── PublishButton.tsx
│   │   ├── listings
│   │   │   ├── api
│   │   │   │   └── queries.ts
│   │   │   ├── components
│   │   │   │   ├── ImageGallery.tsx
│   │   │   │   ├── ListingCard.tsx
│   │   │   │   └── ShareButton.tsx
│   │   │   └── types
│   │   │       └── index.ts
│   │   ├── location
│   │   │   └── api
│   │   │       ├── actions.ts
│   │   │       └── location-service.ts
│   │   ├── messaging
│   │   │   ├── actions
│   │   │   │   ├── conversation-actions.ts
│   │   │   │   ├── message-actions.ts
│   │   │   │   └── messageActions.ts
│   │   │   └── components
│   │   │       ├── ConversationHeader.tsx
│   │   │       ├── ConversationList.tsx
│   │   │       ├── ConversationListServer.tsx
│   │   │       ├── MessageBubble.tsx
│   │   │       ├── MessageComposer.tsx
│   │   │       ├── MessageThread.tsx
│   │   │       ├── MessageTimeline.tsx
│   │   │       ├── RealtimeSubscriber.tsx
│   │   │       └── skeletons.tsx
│   │   ├── notifications
│   │   │   ├── actions
│   │   │   │   └── notification-actions.ts
│   │   │   ├── components
│   │   │   │   ├── MarkAllReadButton.tsx
│   │   │   │   ├── Notification.tsx
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   ├── NotificationEmptyState.tsx
│   │   │   │   ├── NotificationHeader.tsx
│   │   │   │   ├── NotificationItem.tsx
│   │   │   │   ├── NotificationTimeline.tsx
│   │   │   │   └── NotificationWorkspace.tsx
│   │   │   ├── types
│   │   │   │   └── index.ts
│   │   │   └── utils
│   │   │       └── notification-mapper.ts
│   │   ├── profile
│   │   │   ├── actions
│   │   │   │   └── preferences-actions.ts
│   │   │   ├── api
│   │   │   │   └── preferences.ts
│   │   │   ├── components
│   │   │   │   ├── identity
│   │   │   │   │   ├── IdentityForms.tsx
│   │   │   │   │   ├── ProfileField.tsx
│   │   │   │   │   ├── ProfileOverview.tsx
│   │   │   │   │   ├── ProfileSection.tsx
│   │   │   │   │   └── VerificationSection.tsx
│   │   │   │   ├── ProfileNav.tsx
│   │   │   │   ├── SettingsForms.tsx
│   │   │   │   └── SettingsNav.tsx
│   │   │   └── types
│   │   │       └── preferences.ts
│   │   ├── reviews
│   │   │   ├── actions
│   │   │   │   └── submitReview.ts
│   │   │   └── components
│   │   │       └── ReviewForm.tsx
│   │   ├── search
│   │   │   ├── components
│   │   │   │   ├── ActiveFilters.tsx
│   │   │   │   ├── SearchFilterBar.tsx
│   │   │   │   └── SearchMap.tsx
│   │   │   ├── hooks
│   │   │   │   └── useSearchUrl.ts
│   │   │   └── lib
│   │   │       ├── accommodation-types.ts
│   │   │       └── search-params.ts
│   │   └── stays
│   │       ├── actions
│   │       │   └── stayActions.ts
│   │       ├── api
│   │       │   └── queries.ts
│   │       └── components
│   │           └── StayList.tsx
│   ├── hooks
│   │   └── use-toast.ts
│   ├── lib
│   │   ├── formatters
│   │   │   └── time.ts
│   │   ├── supabase
│   │   │   ├── client.ts
│   │   │   ├── middleware.ts
│   │   │   └── server.ts
│   │   ├── logger.ts
│   │   ├── safeAction.ts
│   │   └── utils.ts
│   ├── server
│   ├── test
│   │   └── setup.ts
│   ├── types
│   │   ├── database.types.ts
│   │   ├── profile.ts
│   │   └── supabase.ts
│   └── proxy.ts
├── supabase
│   ├── archive
│   │   └── migrations_v1_history
│   │       ├── 20260730000000_initial_schema.sql
│   │       ├── 20260730100000_iam_policies.sql
│   │       ├── 20260730300000_public_ids.sql
│   │       ├── 20260730400000_rpc_get_listing.sql
│   │       ├── 20260730450000_property_types.sql
│   │       ├── 20260730500000_seed_data.sql
│   │       ├── 20260731000000_lifecycle_pivot.sql
│   │       ├── 20260731010000_seed_lifecycle.sql
│   │       ├── 20260731020000_rpc_get_listing_lifecycle.sql
│   │       ├── 20260731030000_india_first_schema.sql
│   │       ├── 20260731040000_india_first_seed.sql
│   │       ├── 20260731050000_rpc_india_first.sql
│   │       ├── 20260731060000_maintenance_fee_and_buckets.sql
│   │       ├── 20260731070000_listing_images_metadata.sql
│   │       ├── 20260731080000_profile_refinements.sql
│   │       ├── 20260731090000_rpc_search_listings.sql
│   │       └── 20260801000000_host_platform_setup.sql
│   ├── functions
│   │   ├── sync-ical
│   │   │   └── index.ts
│   │   └── deno.json
│   ├── migrations
│   │   ├── 00000000000000_initial_schema.sql
│   │   ├── 20260731080000_profile_redesign.sql
│   │   ├── 20260731090000_remove_unused_profile_fields.sql
│   │   ├── 20260731174500_remove_languages.sql
│   │   ├── 20260731180000_occupation_enum.sql
│   │   ├── 20260731181500_add_address.sql
│   │   ├── 20260731183000_v1_schema_freeze.sql
│   │   ├── 20260801000000_add_geographic_hierarchy.sql
│   │   ├── 20260801000001_seed_geography.sql
│   │   ├── 20260801000002_schema_cleanup.sql
│   │   ├── 20260801000003_security_and_indexes.sql
│   │   └── 20260801000004_patch_initplan.sql
│   ├── schema
│   │   ├── 00_extensions.sql
│   │   ├── 01_types.sql
│   │   ├── 02_identity.sql
│   │   ├── 04_accommodations.sql
│   │   ├── 05_listings.sql
│   │   ├── 06_listing_images.sql
│   │   ├── 07_pricing.sql
│   │   ├── 08_availability.sql
│   │   ├── 08_search.sql
│   │   ├── 09_bookings.sql
│   │   ├── 10_stays.sql
│   │   ├── 11_reviews.sql
│   │   ├── 12_notifications.sql
│   │   ├── 13_messaging.sql
│   │   ├── 14_storage.sql
│   │   ├── 15_shared.sql
│   │   ├── 16_seed_reference_data.sql
│   │   ├── 17_seed_demo_data.sql
│   │   ├── 18_indexes.sql
│   │   ├── 21_calendar_sync.sql
│   │   ├── 22_cron_jobs.sql
│   │   ├── 25_user_preferences.sql
│   │   ├── bootstrap.sql
│   │   ├── build_migration.js
│   │   └── README.md
│   └── tests
│       └── rls.test.ts
├── tests
│   ├── accessibility
│   ├── api
│   ├── fixtures
│   ├── journeys
│   ├── security
│   ├── smoke
│   ├── visual
│   ├── a11y.spec.ts
│   └── example.spec.ts
├── .env.local
├── .gitignore
├── .lintstagedrc.json
├── .prettierrc.json
├── AGENTS.md
├── check_indexes.js
├── CLAUDE.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── PRODUCT.md
├── README.md
├── tailwind.config.ts
├── test-query-env.js
├── test-query.ts
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── vitest.config.mts
└── vitest.config.ts

```
