"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconSend } from "@tabler/icons-react";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScreenshot: string | null;
}

export default function BugReportModal({
  isOpen,
  onClose,
  initialScreenshot,
}: BugReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
    },
    validate: {
      title: (value) => (!value ? "Title is required" : null),
      description: (value) => (!value ? "Description is required" : null),
    },
  });

  // Set initial screenshot when modal opens
  useEffect(() => {
    if (isOpen && initialScreenshot) {
      setScreenshot(initialScreenshot);
    }
  }, [isOpen, initialScreenshot]);

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          screenshot,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit report");

      notifications.show({
        title: "Success",
        message: "Bug report submitted successfully",
        color: "green",
      });

      form.reset();
      setScreenshot(null);
      onClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to submit bug report",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Report a Bug"
      size="lg"
      closeOnClickOutside={false}
    >
      <LoadingOverlay visible={isSubmitting || isCapturing} />

      <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
        <TextInput
          label="Title"
          placeholder="Brief description of the issue"
          required
          {...form.getInputProps("title")}
        />

        <Textarea
          label="Description"
          placeholder="Detailed description of the bug, steps to reproduce, etc."
          required
          minRows={4}
          {...form.getInputProps("description")}
        />

        <div>
          <Text size="sm" fw={500} mb={8}>
            Screenshot
          </Text>
          {
            <div>
              <Image
                src={screenshot}
                alt="Screenshot"
                radius="md"
                mb="sm"
                style={{ maxHeight: 200, objectFit: "contain" }}
              />
            </div>
          }
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            leftSection={<IconSend size={16} />}
            loading={isSubmitting}
          >
            Submit Report
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
