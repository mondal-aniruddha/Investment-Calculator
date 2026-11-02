with open("frontend/e2e/auth.spec.js", "r", encoding="utf-8", newline="") as f:
    c = f.read()

# Fix 1: registration OTP assertion - scope to otp-input widget
old1 = (
    "  // Should transition to OTP step (in-page, not full reload)\r\n"
    "  await expect(page.getByTestId('otp-input')).toBeVisible()\r\n"
    "  await expect(page.getByText(/\\+91\\*\\*\\*\\*\\*\\*3210/)).toBeVisible()"
)
new1 = (
    "  // Should transition to OTP step (in-page, not full reload)\r\n"
    "  const otpWidget = page.getByTestId('otp-input')\r\n"
    "  await expect(otpWidget).toBeVisible()\r\n"
    "  await expect(otpWidget.getByText(/\\+91\\*\\*\\*\\*\\*\\*3210/)).toBeVisible()"
)

# Fix 2: 2FA login OTP assertion - scope to otp-input widget
old2 = (
    "  // OTP step appears\r\n"
    "  await expect(page.getByTestId('otp-input')).toBeVisible()\r\n"
    "  await expect(page.getByText(/\\+91\\*\\*\\*\\*\\*\\*9999/)).toBeVisible()"
)
new2 = (
    "  // OTP step appears\r\n"
    "  const otpWidget2fa = page.getByTestId('otp-input')\r\n"
    "  await expect(otpWidget2fa).toBeVisible()\r\n"
    "  await expect(otpWidget2fa.getByText(/\\+91\\*\\*\\*\\*\\*\\*9999/)).toBeVisible()"
)

assert old1 in c, f"old1 not found"
assert old2 in c, f"old2 not found"

c = c.replace(old1, new1, 1)
c = c.replace(old2, new2, 1)

with open("frontend/e2e/auth.spec.js", "w", encoding="utf-8", newline="") as f:
    f.write(c)

print("Fixed both assertions")

