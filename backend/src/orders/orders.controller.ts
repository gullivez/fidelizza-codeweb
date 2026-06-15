import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { OrdersService } from './orders.service';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId/orders')
@UseGuards(RestaurantAccessGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista pedidos do restaurante (paginado)' })
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.ordersService.findAll(
      restaurantId,
      query.page,
      query.limit,
      query.status,
      query.from,
      query.to,
    );
  }
}
