/*
 * lcd1602.h
 *
 *  Created on: May 27, 2022
 *      Author: noppakorn
 */

#ifndef INC_LCD1602_H_
#define INC_LCD1602_H_
#include <string.h>
#define LCD_ADDR (0x27 << 1)

#define PIN_RS    (1 << 0)
#define PIN_EN    (1 << 2)
#define BACKLIGHT (1 << 3)

#define LCD_DELAY_MS 5


#endif /* INC_LCD1602_H_ */
