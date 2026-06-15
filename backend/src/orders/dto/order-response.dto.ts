import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty() id: string;
  @ApiPropertyOptional({ nullable: true }) externalId: string | null;
  @ApiProperty() name: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPrice: number;
  @ApiProperty() totalPrice: number;
}

export class OrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() restaurantId: string;
  @ApiProperty() customerId: string;
  @ApiProperty() externalId: string;
  @ApiProperty() status: string;
  @ApiProperty() totalAmount: number;
  @ApiProperty() orderedAt: Date;
  @ApiProperty() createdAt: Date;
}

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] }) data: OrderResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
