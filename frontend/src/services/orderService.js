// Mock orders data
const mockOrders = [
    {
      id: '000001',
      date: '2024-01-10T10:30:00Z',
      total: 8497,
      status: 'delivered',
      items: [
        { id: 1, name: 'Classic Leather Wallet', quantity: 1, price: 2499 },
        { id: 2, name: 'Premium Leather Belt', quantity: 1, price: 3499 },
        { id: 4, name: 'Business Card Holder', quantity: 1, price: 1499 }
      ],
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Main St',
        city: 'Karachi',
        phone: '+92 300 1234567'
      },
      paymentMethod: 'card',
      paymentDetails: {
        cardLast4: '4242'
      }
    },
    {
      id: '000002',
      date: '2024-01-15T14:20:00Z',
      total: 12999,
      status: 'processing',
      items: [
        { id: 6, name: 'Travel Duffel Bag', quantity: 1, price: 12999 }
      ],
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Main St',
        city: 'Lahore',
        phone: '+92 300 1234567'
      },
      paymentMethod: 'cod'
    },
    {
      id: '000003',
      date: '2024-01-20T09:15:00Z',
      total: 4999,
      status: 'shipped',
      items: [
        { id: 5, name: 'Leather Laptop Sleeve', quantity: 1, price: 4999 }
      ],
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Main St',
        city: 'Islamabad',
        phone: '+92 300 1234567'
      },
      paymentMethod: 'card',
      paymentDetails: {
        cardLast4: '4242'
      }
    }
  ];
  
  // Get all orders for a user
  export const getOrders = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockOrders;
  };
  
  // Get single order by ID
  export const getOrderById = async (orderId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const order = mockOrders.find(order => order.id === orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  };
  
  // Cancel order
  export const cancelOrder = async (orderId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const orderIndex = mockOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    if (mockOrders[orderIndex].status !== 'processing') {
      throw new Error('Order cannot be cancelled');
    }
    
    mockOrders[orderIndex].status = 'cancelled';
    return mockOrders[orderIndex];
  };
  
  // Track order
  export const trackOrder = async (orderId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const order = mockOrders.find(order => order.id === orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Mock tracking information
    const trackingInfo = {
      orderId: order.id,
      status: order.status,
      timeline: [
        {
          status: 'order_placed',
          date: order.date,
          description: 'Order placed successfully'
        },
        {
          status: 'processing',
          date: new Date(new Date(order.date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          description: 'Order is being processed'
        }
      ]
    };
  
    if (order.status === 'shipped' || order.status === 'delivered') {
      trackingInfo.timeline.push({
        status: 'shipped',
        date: new Date(new Date(order.date).getTime() + 48 * 60 * 60 * 1000).toISOString(),
        description: 'Order has been shipped'
      });
    }
  
    if (order.status === 'delivered') {
      trackingInfo.timeline.push({
        status: 'delivered',
        date: new Date(new Date(order.date).getTime() + 96 * 60 * 60 * 1000).toISOString(),
        description: 'Order has been delivered'
      });
    }
  
    return trackingInfo;
  };