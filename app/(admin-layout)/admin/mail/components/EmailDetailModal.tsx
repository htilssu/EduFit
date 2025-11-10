"use client";

import { Modal, Badge, Table } from "@mantine/core";
import { format } from "date-fns";

interface Email {
  id: string;
  subject: string;
  content: string;
  recipients: string[];
  cc: string[];
  bcc: string[];
  status: string;
  sentBy: string;
  sentByUser: {
    name: string | null;
    email: string;
    username: string;
  };
  sentAt: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EmailDetailModalProps {
  email: Email | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  DRAFT: "gray",
  SENDING: "blue",
  SENT: "green",
  FAILED: "red",
};

export default function EmailDetailModal({
  email,
  onClose,
}: EmailDetailModalProps) {
  if (!email) return null;

  return (
    <Modal
      opened={!!email}
      onClose={onClose}
      title="Email Details"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <div className="mt-1">
            <Badge color={statusColors[email.status]}>{email.status}</Badge>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Subject</label>
          <p className="mt-1 text-gray-900">{email.subject}</p>
        </div>

        {email.recipients.length === 0 && email.cc.length === 0 && email.bcc.length > 0 ? (
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Recipients
            </label>
            <div className="mt-1 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                📧 Sent to all users (BCC: {email.bcc.length} recipients)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                All non-admin users received this email privately
              </p>
            </div>
          </div>
        ) : (
          <>
            {email.recipients.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  To ({email.recipients.length})
                </label>
                <div className="mt-1 space-y-1">
                  {email.recipients.map((recipient, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {recipient}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {email.cc.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  CC ({email.cc.length})
                </label>
                <div className="mt-1 space-y-1">
                  {email.cc.map((recipient, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {recipient}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {email.bcc.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  BCC ({email.bcc.length})
                </label>
                <div className="mt-1 space-y-1">
                  {email.bcc.map((recipient, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {recipient}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div>
          <label className="text-sm font-semibold text-gray-700">Content</label>
          <div
            className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 text-sm"
            dangerouslySetInnerHTML={{ __html: email.content }}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Sent By</label>
          <p className="mt-1 text-gray-900">
            {email.sentByUser.name || email.sentByUser.username} (
            {email.sentByUser.email})
          </p>
        </div>

        <Table>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td className="font-semibold">Created At</Table.Td>
              <Table.Td>
                {format(new Date(email.createdAt), "MMM dd, yyyy HH:mm:ss")}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className="font-semibold">Updated At</Table.Td>
              <Table.Td>
                {format(new Date(email.updatedAt), "MMM dd, yyyy HH:mm:ss")}
              </Table.Td>
            </Table.Tr>
            {email.sentAt && (
              <Table.Tr>
                <Table.Td className="font-semibold">Sent At</Table.Td>
                <Table.Td>
                  {format(new Date(email.sentAt), "MMM dd, yyyy HH:mm:ss")}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        {email.error && (
          <div>
            <label className="text-sm font-semibold text-red-700">Error</label>
            <p className="mt-1 text-red-600 text-sm">{email.error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
