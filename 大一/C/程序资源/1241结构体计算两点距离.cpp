//二维平面上的一个点可用坐标(x,y)的表示，
//请先定义一个描述平面点的结构体类型struct point，
//然后在主函数中定义两个这种类型的变量，
//并调用float distance(struct point p1, struct point p2)
//计算并返回两个点的距离
#include"stdio.h"
#include"math.h"
struct point
{
	int x;
	int y;
}; 
float distance(struct point p1,struct point p2)
{
	int dx=p2.x-p1.x;
	int dy=p2.y-p1.y;
	return sqrt(dx * dx + dy * dy);
}
int main()
{
	struct point p1,p2;
	scanf("%d %d",&p1.x,&p1.y);
	scanf("%d %d",&p2.x,&p2.y);
	float dis=distance(p1,p2);
	printf("%f",dis);
	return 0;
}
