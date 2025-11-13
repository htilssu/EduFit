# 🐛 Bug Report System - Hệ Thống Báo Lỗi

## 🎯 Tổng Quan

Hệ thống báo lỗi hoàn chỉnh cho phép người dùng:
- Report bugs với screenshot tự động
- Theo dõi progress của reports
- Chat với admin để giải quyết vấn đề

Admin có thể:
- Xem tất cả reports
- Phân loại theo status
- Reply và cập nhật status
- Theo dõi conversation

## ✅ Đã Hoàn Thành

### 1. Database Schema ✅
```prisma
enum ReportStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

model Report {
  id          String         @id
  title       String
  description String
  screenshot  String?
  status      ReportStatus   @default(OPEN)
  userId      String
  user        User
  messages    ReportMessage[]
  createdAt   DateTime
  updatedAt   DateTime
}

model ReportMessage {
  id        String   @id
  reportId  String
  report    Report
  userId    String
  user      User
  message   String
  isAdmin   Boolean  @default(false)
  createdAt DateTime
}
```

### 2. API Routes ✅

**User APIs:**
- ✅ `POST /api/reports` - Create report
- ✅ `GET /api/reports` - Get user's reports
- ✅ `GET /api/reports/[id]` - Get report detail
- ✅ `POST /api/reports/[id]/messages` - Add message

**Admin APIs:**
- ✅ `GET /api/admin/reports` - Get all reports (with status filter)
- ✅ `PATCH /api/admin/reports` - Update report status

### 3. UI Components ✅

**Float Button:**
- ✅ Fixed bottom-right corner
- ✅ Red button with bug icon
- ✅ Shadow and hover effects

**Bug Report Modal:**
- ✅ Auto-capture screenshot when opened
- ✅ Title & Description fields
- ✅ Screenshot preview
- ✅ Retake screenshot option
- ✅ html2canvas integration

### 4. Dependencies ✅
- ✅ Installed: `html2canvas@1.4.1`

## 📁 File Structure

```
app/
├── (layout)/
│   ├── components/
│   │   ├── BugReportButton.tsx       ✅ Float button
│   │   └── BugReportModal.tsx        ✅ Report form + screenshot
│   ├── reports/
│   │   ├── page.tsx                  ⏳ User reports list
│   │   └── [id]/
│   │       └── page.tsx              ⏳ Report detail + chat
│   └── layout.tsx                    ✅ Added BugReportButton
│
├── (admin-layout)/admin/
│   └── reports/
│       ├── page.tsx                  ⏳ Admin reports list
│       └── [id]/
│           └── page.tsx              ⏳ Admin report detail + chat
│
└── api/
    ├── reports/
    │   ├── route.ts                  ✅ Create & list reports
    │   └── [id]/
    │       ├── route.ts              ✅ Get report detail
    │       └── messages/
    │           └── route.ts          ✅ Add message
    └── admin/
        └── reports/
            └── route.ts              ✅ Admin list & update status
```

## 🎨 Features

### Float Button
- **Position:** Fixed bottom-right (24px from edges)
- **Color:** Red
- **Icon:** Bug icon
- **Shadow:** Elevated with shadow
- **Z-index:** 50 (above most content)

### Screenshot Capture
- **Automatic:** Captures when modal opens
- **Quality:** JPEG 70% to reduce size
- **Scale:** 0.5x to save space
- **Retake:** User can retake if needed
- **Preview:** Shows thumbnail in modal

### Report Status Flow
```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
  ↓         ↓            ↓
(Can be changed by admin)
```

### Chat/Messaging
- User can send messages
- Admin can reply
- Messages show sender role (admin badge)
- Chronological order
- Real-time updates

## 🚀 Next Steps

### User Pages (TODO)
```typescript
// app/(layout)/reports/page.tsx
- List of user's reports
- Status badges
- Click to view detail
- Pagination
```

```typescript
// app/(layout)/reports/[id]/page.tsx
- Report details
- Screenshot display
- Chat interface
- Send message form
- Status indicator
```

### Admin Pages (TODO)
```typescript
// app/(admin-layout)/admin/reports/page.tsx
- All reports list
- Filter by status tabs
- User info display
- Quick actions
- Pagination
```

```typescript
// app/(admin-layout)/admin/reports/[id]/page.tsx
- Full report details
- Chat interface
- Status update dropdown
- Admin reply form
- Screenshot zoom
```

## 📊 Database Schema Details

### Report Model
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique ID |
| title | String | Short description |
| description | String | Detailed description |
| screenshot | String? | Base64 image data |
| status | ReportStatus | Current status |
| userId | String | Reporter ID |
| messages | ReportMessage[] | Conversations |
| createdAt | DateTime | Created time |
| updatedAt | DateTime | Last updated |

### ReportMessage Model
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique ID |
| reportId | String | Related report |
| userId | String | Sender ID |
| message | String | Message content |
| isAdmin | Boolean | Is admin reply? |
| createdAt | DateTime | Sent time |

## 🎨 UI Design Specs

### Float Button
```css
position: fixed;
bottom: 24px;
right: 24px;
z-index: 50;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
border-radius: 9999px;
background: red;
```

### Report Modal
```
┌─────────────────────────────────────┐
│ Report a Bug                    [X] │
├─────────────────────────────────────┤
│                                     │
│ Title *                             │
│ [Brief description...]              │
│                                     │
│ Description *                       │
│ ┌─────────────────────────────────┐ │
│ │ Detailed description...         │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Screenshot                          │
│ ┌─────────────────────────────────┐ │
│ │     [Screenshot Preview]        │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ [Retake Screenshot]                 │
│                                     │
│          [Cancel] [Submit Report]   │
└─────────────────────────────────────┘
```

### Status Badges
```typescript
const statusColors = {
  OPEN: "blue",
  IN_PROGRESS: "yellow",
  RESOLVED: "green",
  CLOSED: "gray",
};
```

## 🔧 Setup Instructions

### Step 1: Generate Prisma Client
```bash
pnpm prisma generate
```

### Step 2: Push Schema to Database
```bash
pnpm prisma db push
```

### Step 3: Restart Dev Server
```bash
pnpm dev
```

## 📝 API Usage Examples

### Create Report
```typescript
const response = await fetch("/api/reports", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Button not working",
    description: "Submit button doesn't respond to clicks",
    screenshot: "data:image/jpeg;base64,...",
  }),
});
```

### Get User Reports
```typescript
const response = await fetch("/api/reports?page=1&limit=10");
const { reports, pagination } = await response.json();
```

### Send Message
```typescript
const response = await fetch(`/api/reports/${reportId}/messages`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "I tried restarting but still not working",
  }),
});
```

### Admin Update Status
```typescript
const response = await fetch("/api/admin/reports", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    reportId: "xxx",
    status: "IN_PROGRESS",
  }),
});
```

## 🐛 Troubleshooting

### Screenshot không capture được?
- Check CORS settings
- Verify html2canvas loaded
- Try retake screenshot button

### Float button không hiện?
- Check z-index conflicts
- Verify BugReportButton imported in layout
- Check authentication (might need to show only for logged-in users)

### Messages không gửi được?
- Verify user owns report or is admin
- Check reportId valid
- Verify authentication

## 💡 Future Enhancements

- [ ] File attachments (multiple images)
- [ ] Video recording
- [ ] Browser info auto-capture
- [ ] Email notifications
- [ ] Report priority levels
- [ ] Tags/categories
- [ ] Search reports
- [ ] Export reports
- [ ] Analytics dashboard
- [ ] Mobile app support

## 📚 Related Documentation

- Prisma Schema: `prisma/schema.prisma`
- API Routes: `app/api/reports/`
- Components: `app/(layout)/components/`

---

**Status:** ✅ Core system complete, UI pages pending
**Next:** Create user and admin report list/detail pages
