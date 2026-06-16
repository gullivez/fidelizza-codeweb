import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty() externalId: string;
  @ApiProperty() status: string;
  @ApiProperty() totalAmount: number;
  @ApiProperty() orderedAt: Date;
}

export class CustomerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() restaurantId: string;
  @ApiProperty() phone: string;
  @ApiProperty() name: string;
  @ApiProperty() totalOrders: number;
  @ApiProperty() totalSpent: number;
  @ApiProperty() avgTicket: number;
  @ApiPropertyOptional({ nullable: true }) lastOrderAt: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiPropertyOptional({ nullable: true, example: 'champions' })
  segmentName: string | null;
}

export class CustomerDetailResponseDto extends CustomerResponseDto {
  @ApiProperty({ type: [OrderSummaryDto] }) recentOrders: OrderSummaryDto[];
}

export class CustomerListResponseDto {
  @ApiProperty({ type: [CustomerResponseDto] }) data: CustomerResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
