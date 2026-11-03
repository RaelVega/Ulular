import { describe, expect, it } from "vitest";
import {
  canEditSettings,
  canManageReviews,
  canManageStaff,
  canViewPin,
  DEFAULT_STAFF_LIST,
  loadStoredStaffList,
} from "../bookings-store";

describe("Staff Roles and Permissions", () => {
  it("incluye a Rael con rol developer por defecto", () => {
    const dev = DEFAULT_STAFF_LIST.find(
      (s) => s.email === "raelvega33@gmail.com",
    );
    expect(dev).toBeDefined();
    expect(dev?.name).toBe("Rael");
    expect(dev?.role).toBe("developer");
  });

  it("incluye al dueño con rol superadmin y al staff con rol admin", () => {
    const superadmin = DEFAULT_STAFF_LIST.find(
      (s) => s.email === "ulularsaladeensayo@gmail.com",
    );
    const admin = DEFAULT_STAFF_LIST.find(
      (s) => s.email === "staff.ulular@gmail.com",
    );

    expect(superadmin?.role).toBe("superadmin");
    expect(admin?.role).toBe("admin");
  });

  it("permite a developer y superadmin gestionar staff y editar ajustes", () => {
    expect(canManageStaff("developer")).toBe(true);
    expect(canManageStaff("superadmin")).toBe(true);
    expect(canManageStaff("admin")).toBe(false);

    expect(canEditSettings("developer")).toBe(true);
    expect(canEditSettings("superadmin")).toBe(true);
    expect(canEditSettings("admin")).toBe(false);
  });

  it("solo permite a developer y superadmin ver/modificar el PIN y reviews", () => {
    expect(canViewPin("developer")).toBe(true);
    expect(canViewPin("superadmin")).toBe(true);
    expect(canViewPin("admin")).toBe(false);

    expect(canManageReviews("developer")).toBe(true);
    expect(canManageReviews("superadmin")).toBe(true);
    expect(canManageReviews("admin")).toBe(false);
  });

  it("loadStoredStaffList devuelve la lista con los 3 roles", () => {
    const list = loadStoredStaffList();
    expect(list.length).toBeGreaterThanOrEqual(3);
    const dev = list.find((s) => s.email === "raelvega33@gmail.com");
    expect(dev?.role).toBe("developer");
  });
});
