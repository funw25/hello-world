//本题要求编写程序，计算平面上两个向量的和向量
//假设向量的起点在原点，终点坐标的两个分量分别是x、y
//在一行中按照“x1 y1 x2 y2”的格式输入两个平面向量
//v1=(x1,y1)和v2=(x2,y2)的分量。
//在一行中按照(x, y)的格式输出和向量，保留一位小数。
#include"stdio.h"
struct XL
{
	float x;
	float y;
};
int main()
{
	struct XL xl1,xl2,result;
	scanf("%f %f %f %f",&xl1.x,&xl1.y,&xl2.x,&xl2.y);
	result.x=xl1.x+xl2.x;
	result.y=xl1.y+xl2.y;
	printf("(%.1f, %.1f)",result.x,result.y);
	return 0;
} 
