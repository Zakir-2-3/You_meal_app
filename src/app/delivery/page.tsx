import Image from "next/image";

import NavButtons from "@/components/NavButtons/NavButtons";

import deliveryPageImg from "@/assets/images/delivery-page-img.png";

import "./deliveryPage.scss";

export default function DeliveryPage() {
  return (
    <section className="delivery-page-section">
      <div className="container">
        <h1 className="delivery-page-section__title">Доставка YourMeal</h1>
        <NavButtons customTitle="Доставка" />
        <div className="delivery-page-section__img">
          <Image
            src={deliveryPageImg}
            priority
            alt="delivery-page-img"
            width={500}
            height={560}
          />
        </div>
        <div className="delivery-page-section__info">
          <h2>Как заказать YourMeal на дом</h2>
          <ul>
            <li>
              Возьмите любой гаджет с выходом в интернет, зайдите на официальный
              сайт сети и нажмите «Заказать сейчас»;
            </li>
            <li>
              Укажите регион и ресурс выполнит автоматическое перенаправление;
            </li>
            <li>
              Зайдите в персональный аккаунт (иконка расположена в левом углу
              вверху);
            </li>
            <li>Добавьте Ваше местоположение;</li>
            <li>Далее совершите оплату.</li>
            <li>
              Ожидаете прибытие курьера. Время доставки и маршрут курьера можно
              отслеживать в приложении.
            </li>
          </ul>
          <h2>До какого времени работает доставка YourMeal</h2>
          <p>
            Оформить заказ в YourMeal можно круглосуточно, удобным из
            представленных выше способов. Однако, доставка заказанной еды
            осуществляется в определенные часы - в период с 10:00 до 03:00.
          </p>
          <p>
            В некоторых случаях, в праздничные или выходные дни, график доставки
            может меняться. Об этом пользователи, могут узнать на нашем сайте
            или на официальном сайте оформив подписку на новости и акции. Так же
            актуальная информация дублируется в мобильном приложении.
          </p>
          <h2>Стоимость и время доставки в YourMeal</h2>
          <ul>
            <li>
              Если сумма чека составляет больше 599 рублей (зависит от региона,
              в котором функционирует заведение) доставка еды осуществляется
              бесплатно;
            </li>
            <li>
              Доставка заказных позиций производится от 15 и более минут. Время
              доставки зависит от удаленности клиента и дорожной ситуации в
              городе;
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
