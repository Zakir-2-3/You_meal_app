import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";
import { orderEmailTemplate } from "@/lib/emailTemplates/orderEmailTemplate";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      items,
      rawTotal, // чистый счёт (без скидок)
      discount, // суммарный % скидки
      vat,
      tips,
      tipsPercent,
      finalTotal,
      activated,
    } = await req.json();

    if (!email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    // Загружаем пользователя
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, ordercount")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("Ошибка загрузки пользователя:", fetchError.message);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newOrderNumber = (user.ordercount ?? 0) + 1;

    // Обновляем корзину и orderCount
    const { error: updateError } = await supabase
      .from("users")
      .update({
        cart: [],
        ordercount: newOrderNumber,
      })
      .eq("email", email);

    if (updateError) {
      console.error("Ошибка обновления пользователя:", updateError.message);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Отправляем письмо
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"YourMeal" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Ваш заказ №${newOrderNumber} подтверждён`,
        html: orderEmailTemplate({
          orderNumber: newOrderNumber,
          items,
          rawTotal,
          discount,
          vat,
          tips,
          tipsPercent,
          finalTotal,
          activated,
        }),
      });
    } catch (mailError: any) {
      console.error("Ошибка отправки письма:", mailError);
    }

    return NextResponse.json({ success: true, orderNumber: newOrderNumber });
  } catch (err: any) {
    console.error("Ошибка оформления заказа:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
