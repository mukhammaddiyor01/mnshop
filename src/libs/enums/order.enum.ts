export enum OrderStatus {
    PENDING = "PENDING",
    PROCCESSING = "PROCCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}

export enum DeliveryStatus {
    PENDING = "PENDING",
    PROCCESSING = "PROCCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
}

export enum PaymentMethod {
    STRIPS = "STRIPS",
    PAYME = "PAYME",
    CLICK = "CLICK"
}