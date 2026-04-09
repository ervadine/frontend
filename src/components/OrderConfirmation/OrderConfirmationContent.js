// components/OrderConfirmation/OrderConfirmationContent.js
import React from 'react';
import PageTitle from './PageTitle';
import ConfirmationHeader from './ConfirmationHeader';
import OrderDetails from './OrderDetails';
import OrderSummary from './OrderSummary';
import NextSteps from './NextSteps';

const OrderConfirmationContent = ({ 
  orderData, 
  orderId, 
  paymentStatus,
  paymentProcessing,
  paymentCompleted 
}) => {
  return (
    <>
      <PageTitle />
      
      <section id="order-confirmation" className="order-confirmation section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="order-confirmation-1">
            <ConfirmationHeader 
              orderNumber={orderData.orderNumber}
              orderDate={orderData.orderDate}
              orderStatus={orderData.status}
              paymentStatus={paymentStatus}
              paymentProcessing={paymentProcessing}
              paymentCompleted={paymentCompleted}
            />
            
            <OrderDetails 
              customer={orderData.customer}
              shipping={orderData.shipping}
              payment={orderData.payment}
              orderId={orderId}
              orderStatus={orderData.status}
            />
            
            <OrderSummary 
              items={orderData.items}
              totals={orderData.totals}
            />
           <NextSteps 
  email={orderData.customer.email}
  orderId={orderId}
  orderStatus={orderData.status}
  paymentStatus={paymentStatus}
/>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderConfirmationContent;