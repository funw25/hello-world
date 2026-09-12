//已知函数e的x次方可以展开为幂级数1+x+x*x/2!+x*x*x/3!...
//现给定一个实数x，要求利用此幂级数部分和求的近似值，求和一直继续到最后一项的绝对值小于0.00001。
//输入在一行中给出一个实数x∈[0,5]。
//一行中输出满足条件的幂级数部分和，保留小数点后四位。
//样例输入1.2样例输出 3.3201。最后一项的绝对值小于0.00001时需要累加一次，然后退出循环。
#include<stdio.h> 
#include<math.h>
int main()
{
	double x,sum=1.0,term=1.0;
	int i=1;
	scanf("%lf",&x);
	for(i=1; ;i++){
		term=term*x/i;
		sum=sum+term;
		if(term<0.00001){
			break;
		}
	}
	printf("%.4f",sum);
	return 0;
}
