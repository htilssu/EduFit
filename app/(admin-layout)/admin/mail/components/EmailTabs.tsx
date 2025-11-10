"use client";

import { Tabs } from "@mantine/core";
import {
  IconMail,
  IconMailOpened,
  IconClock,
  IconAlertCircle,
  IconInbox,
} from "@tabler/icons-react";

type EmailStatus = "ALL" | "DRAFT" | "SENDING" | "SENT" | "FAILED";

interface EmailTabsProps {
  activeTab: EmailStatus;
  onTabChange: (tab: EmailStatus) => void;
}

export default function EmailTabs({ activeTab, onTabChange }: EmailTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onChange={(value) => onTabChange(value as EmailStatus)}
      className="mb-6"
    >
      <Tabs.List>
        <Tabs.Tab value="ALL" leftSection={<IconInbox size={16} />}>
          All
        </Tabs.Tab>
        <Tabs.Tab value="DRAFT" leftSection={<IconMail size={16} />}>
          Draft
        </Tabs.Tab>
        <Tabs.Tab value="SENDING" leftSection={<IconClock size={16} />}>
          Sending
        </Tabs.Tab>
        <Tabs.Tab value="SENT" leftSection={<IconMailOpened size={16} />}>
          Sent
        </Tabs.Tab>
        <Tabs.Tab value="FAILED" leftSection={<IconAlertCircle size={16} />}>
          Failed
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}
