import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { CustomersService } from './customers.service';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId/customers')
@UseGuards(RestaurantAccessGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista clientes do restaurante (paginado)' })
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() query: ListCustomersQueryDto,
  ) {
    return this.customersService.findAll(
      restaurantId,
      query.page,
      query.limit,
      query.search,
    );
  }

  @Get(':customerId')
  @ApiOperation({ summary: 'Detalhe do cliente com últimos 10 pedidos' })
  findOne(
    @Param('restaurantId') restaurantId: string,
    @Param('customerId') customerId: string,
  ) {
    return this.customersService.findOne(restaurantId, customerId);
  }
}
