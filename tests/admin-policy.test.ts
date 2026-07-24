import assert from "node:assert/strict";
import test from "node:test";
import {
  hasAdminCapability,
  canMarkNotificationRead,
  canTriggerReviewNotification,
  canUseAdminCommand,
  legacyRoles,
  sanitizeEventCreateInput,
  type AdminRole,
} from "../lib/admin/policy.ts";

const identities: Array<{ name: string; roles: AdminRole[] }> = [
  { name: "匿名", roles: [] },
  { name: "普通用户", roles: [] },
  { name: "录入员", roles: ["information_entry"] },
  { name: "审核发布员", roles: ["review_publisher"] },
  { name: "运营管理员", roles: ["operations_admin"] },
  { name: "系统所有者", roles: ["system_owner"] },
];

for (const identity of identities) {
  test(`${identity.name}：后台访问能力符合角色矩阵`, () => {
    assert.equal(
      hasAdminCapability(identity.roles, "admin:access"),
      identity.roles.length > 0
    );
  });
}

test("普通用户不能提权", () => {
  assert.deepEqual(legacyRoles(false, false), []);
  assert.equal(hasAdminCapability([], "admin:manage"), false);
});
test("只有录入、运营和所有者可创建活动", () => {
  assert.equal(hasAdminCapability(["information_entry"], "event:create"), true);
  assert.equal(hasAdminCapability(["review_publisher"], "event:create"), false);
  assert.equal(hasAdminCapability(["operations_admin"], "event:create"), true);
  assert.equal(hasAdminCapability(["system_owner"], "event:create"), true);
});

test("只有审核发布员和所有者可执行审核并发布", () => {
  assert.equal(hasAdminCapability(["information_entry"], "event:review_publish"), false);
  assert.equal(hasAdminCapability(["review_publisher"], "event:review_publish"), true);
  assert.equal(hasAdminCapability(["operations_admin"], "event:review_publish"), false);
  assert.equal(hasAdminCapability(["system_owner"], "event:review_publish"), true);
});

test("活动创建输入会移除创建者、审核、管理员标记和发布字段", () => {
  assert.deepEqual(
    sanitizeEventCreateInput({
      title: "安全测试",
      created_by: "forged-user",
      reviewed_by: "forged-reviewer",
      review_status: "approved",
      is_featured: true,
      is_anirox: true,
      published_at: "2026-07-24T00:00:00Z",
    }),
    { title: "安全测试" }
  );
});

test("普通用户不能触发给审核人写通知", () => {
  assert.equal(canTriggerReviewNotification({ actorId: "user", eventCreatorId: "user", reviewStatus: "pending", roles: [] }), false);
  assert.equal(canTriggerReviewNotification({ actorId: "editor", eventCreatorId: "editor", reviewStatus: "pending", roles: ["information_entry"] }), true);
});

test("用户不能把他人的通知标为已读", () => {
  assert.equal(canMarkNotificationRead("user-a", "user-b"), false);
  assert.equal(canMarkNotificationRead("user-a", "user-a"), true);
});

test("数据库命令层未就绪时所有角色都保持只读", () => {
  assert.equal(canUseAdminCommand(false, ["system_owner"], "event:create"), false);
  assert.equal(canUseAdminCommand(false, ["review_publisher"], "event:review_publish"), false);
});

test("数据库命令层就绪后按角色开放创建和审核发布", () => {
  assert.equal(canUseAdminCommand(true, ["information_entry"], "event:create"), true);
  assert.equal(canUseAdminCommand(true, ["information_entry"], "event:review_publish"), false);
  assert.equal(canUseAdminCommand(true, ["review_publisher"], "event:review_publish"), true);
  assert.equal(canUseAdminCommand(true, ["operations_admin"], "event:create"), true);
  assert.equal(canUseAdminCommand(true, ["system_owner"], "event:review_publish"), true);
});
