/*
 * lcd1602.c
 *
 *  Created on: May 27, 2022
 *      Author: noppakorn
 */
#include "lcd1602.h"
#include "stm32f4xx_hal.h"
extern UART_HandleTypeDef huart2;
extern I2C_HandleTypeDef hi2c2;

void I2C_Scan() {
	char info[] = "Scanning I2C bus...\r\n";
	HAL_UART_Transmit(&huart2, (uint8_t*) info, strlen(info), HAL_MAX_DELAY);

	HAL_StatusTypeDef res;
	for (uint16_t i = 0; i < 128; i++) {
		res = HAL_I2C_IsDeviceReady(&hi2c2, i << 1, 1, 10);
		if (res == HAL_OK) {
			char msg[64];
			snprintf(msg, sizeof(msg), "0x%02X", i);
			HAL_UART_Transmit(&huart2, (uint8_t*) msg, strlen(msg),
					HAL_MAX_DELAY);
		} else {
			HAL_UART_Transmit(&huart2, (uint8_t*) ".", 1, HAL_MAX_DELAY);
		}
	}

	HAL_UART_Transmit(&huart2, (uint8_t*) "\r\n", 2, HAL_MAX_DELAY);
}

HAL_StatusTypeDef LCD_SendInternal(uint8_t lcd_addr, uint8_t data,
		uint8_t flags) {
	HAL_StatusTypeDef res;
	for (;;) {
		res = HAL_I2C_IsDeviceReady(&hi2c2, lcd_addr, 1, HAL_MAX_DELAY);
		if (res == HAL_OK)
			break;
	}

	uint8_t up = data & 0xF0;
	uint8_t lo = (data << 4) & 0xF0;

	uint8_t data_arr[4];
	data_arr[0] = up | flags | BACKLIGHT | PIN_EN;
	data_arr[1] = up | flags | BACKLIGHT;
	data_arr[2] = lo | flags | BACKLIGHT | PIN_EN;
	data_arr[3] = lo | flags | BACKLIGHT;

	res = HAL_I2C_Master_Transmit(&hi2c2, lcd_addr, data_arr, sizeof(data_arr),
			HAL_MAX_DELAY);
	HAL_Delay(LCD_DELAY_MS);
	return res;
}

void LCD_SendCommand(uint8_t lcd_addr, uint8_t cmd) {
	LCD_SendInternal(lcd_addr, cmd, 0);
}

void LCD_SendData(uint8_t lcd_addr, uint8_t data) {
	LCD_SendInternal(lcd_addr, data, PIN_RS);
}

void LCD_Init(uint8_t lcd_addr) {
	// 4-bit mode, 2 lines, 5x7 format
	LCD_SendCommand(lcd_addr, 0b00110000);
	// display & cursor home (keep this!)
	LCD_SendCommand(lcd_addr, 0b00000010);
	// display on, right shift, underline off, blink off
	LCD_SendCommand(lcd_addr, 0b00001100);
	// clear display (optional here)
	LCD_SendCommand(lcd_addr, 0b00000001);
}

void LCD_SendString(uint8_t lcd_addr, char *str) {
	while (*str) {
		LCD_SendData(lcd_addr, (uint8_t) (*str));
		str++;
	}
}
void LCD_Clear(uint8_t lcd_addr) {
	LCD_SendCommand(lcd_addr, 0b00000001);
}
void LCD_WriteLine(uint8_t lcd_addr, uint8_t line_number, char *str) {
	if (line_number == 0) {
		// set address to 0x00
		LCD_SendCommand(lcd_addr, 0b10000000);
		LCD_SendString(lcd_addr, str);
	} else {
		// set address to 0x40
		LCD_SendCommand(lcd_addr, 0b11000000);
		LCD_SendString(lcd_addr, str);
	}
}

