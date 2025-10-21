export const passwordRecoveryEmailTemplate = (
  code: string,
  lang: "ru" | "en" = "ru"
) => {
  const isRu = lang === "ru";

  const texts = {
    title: isRu ? "Восстановление пароля для" : "Password recovery for",
    subtitle: isRu
      ? "Не волнуйтесь, с каждым бывает 🧠🔒"
      : "Don't worry, it happens to everyone 🧠🔒",
    codeTitle: isRu
      ? "Вот ваш код для сброса пароля:"
      : "Here’s your password reset code:",
    valid10min: isRu
      ? "Код действителен в течение 10 минут. Если вы не запрашивали восстановление — просто проигнорируйте это письмо."
      : "The code is valid for 10 minutes. If you didn’t request a password reset, just ignore this email.",
    rights: isRu ? "Все права защищены." : "All rights reserved.",
  };

  return `
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    align="center"
    style="
      background-color: #fff8f0;
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      border: 3px solid #ff8800;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    "
  >
    <tr>
      <td style="padding: 0">
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffab08; padding: 30px 20px">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px">
                <tr>
                  <td style="width: 100px; padding-right: 20px" valign="top">
                    <img
                      src="https://hxkhkagppruuaudgtbwt.supabase.co/storage/v1/object/public/email-assets/food-banner.png"
                      alt="YourMeal"
                      width="85"
                      height="100"
                      style="display: block"
                    />
                  </td>
                  <td valign="middle" style="color: #fff">
                    <h1 style="margin: 0; font-size: 24px; color: #fff;">
                      ${
                        texts.title
                      } <span style="color: #ff5c00;">YourMeal</span>
                    </h1>
                    <p style="margin-top: 10px; font-size: 16px;">${
                      texts.subtitle
                    }</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Code block -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fff; padding: 30px 20px">
          <tr>
            <td align="center">
              <p style="font-size: 18px; color: #333;">${texts.codeTitle}</p>
              <div
                style="
                  font-size: 36px;
                  font-weight: bold;
                  background-color: #ff8800;
                  color: #fff;
                  display: inline-block;
                  padding: 12px 28px;
                  border-radius: 8px;
                  margin-top: 10px;
                  letter-spacing: 4px;
                "
              >
                ${code}
              </div>
              <p style="margin-top: 30px; font-size: 14px; color: #666">
                ${texts.valid10min}
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fff1e6; padding: 15px">
          <tr>
            <td align="center" style="font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} YourMeal. ${texts.rights}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;
};
