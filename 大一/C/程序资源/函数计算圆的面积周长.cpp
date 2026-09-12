//输入圆的半径，要求定义和调用函数，计算圆的面积和周长
//（在主函数中输入，自定函数中输出,PI=3.14）。输出均保留两位小数。

#include<stdio.h>
double s(double r);
double c(double r);
int main()

{
	double r;
	scanf("%lf",&r);
	printf("area=%.2lf, perimeter=%.2lf",s(r),c(r));
}
double PI=3.14;


double s(double r){
	double s;
	s=PI*r*r;
	return s;
}

double c(double r){
	double c;
	c=PI*2*r;
	return c;
}

	
