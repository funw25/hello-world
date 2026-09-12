//函数定义：double dist( double x1, double y1, double x2, double y2 );
//其中用户传入的参数为平面上两个点的坐标(x1, y1)和(x2, y2)，函数dist应返回两点间的距离。

#include <stdio.h>
#include <math.h>
double dist( double x1, double y1, double x2, double y2 );
int main()
{   
    double x1, y1, x2, y2;
    scanf("%lf %lf %lf %lf", &x1, &y1, &x2, &y2);
    printf("dist=%.2f\n", dist(x1, y1, x2, y2));
    return 0;
}
double dist( double x1, double y1, double x2, double y2 ){
	return sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

