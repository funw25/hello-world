
#include<iostream>

using namespace std;

class Clock {
private:
	const int nTest;//常数据成员 
	int H;
	int M;
	int S;



public:
	
	//具有【默认值】的带参构造【4-2】


	//给了三个值则以给的值为准，不给以这个为准（比如只给两个）【4-3】
	Clock(int H = 1, int M = 2, int S = 3): {   //无参和带参可以合二为一，还是带参构造，给带参的参数设置默认值（其实是带参）
		if (H < 0 || H>24) {
			H = 0;//M S 相同
		}
		this->H = H; this->M = M; this->S = S;

	}

public:
	//右修饰为const,表成员函数（这个函数对数据成员只读不写，则应该修饰为常成员函数
	void display()const {
		cout << H << ":" << M << ":" << S << endl;
	}

	};
	int main()
	{
		
		Clock c1(0,0,0);
		Clock c2(33, 12, 12);
		Clock c3(11);//【4-3】就是11 2 3 


		// 【4-1】对象数组必须要求【无参构造】——如何解决？必须无参构造允许存在（上一个笔记
		//【4-2】另一种方法
		Clock aClock[5];//【4-1】创建一个时钟的数组——出现问题了

		c1.display();
		c2.display();
		c3.display();


	    //【4-4】
		for (int i = 0; i < 5; i++) {
			aClock[i].display();
		}

		return 0;
	}
	


	对象数组要如何传入参数？
		belike：

    #include<iostream>
    #include<cstring>
	using namespace std;

	class Student {
	private:
		int nId;
		char name[10];
	public:
		Student(int id, const char* name) {
			nId = id;
			strcpy(this->name, name);

		}   // 有参构造函数



	};
	int main()
	{

		// 方法1：使用花括号逐个构造
		Student arr[2] = { Student(101, "张三"), Student(102, "李四") };

		//// 方法2：如果构造函数不是 explicit，可以直接写参数
		//Student arr2[2] = { {101, "张三"}, {102, "李四"}
		return 0;
	}




/*
1.一个类必须有：
  构造函数：（如果没写，系统会帮助写）
  析构函数：【6】当需要释放资源（如:内存）时，应在析构函数里进行  
          析构函数大多时候不编写，但如果申请了动态的内存分配，要编写
  拷贝构造函数：
  赋值运算（当需要深拷贝）


2.一些特殊的成员
 常成员：常数据成员必须在构造函数的【外部（进行）初始化】   【5-1】
 静态成员：

*/

#include<iostream>

using namespace std;

class Clock {
private:
	const int nTest;//【5】常数据成员——出错了   常数据成员的初始化
	int H;
	int M;
	int S;



public:
	
	//具有【默认值】的带参构造【4-2】


	//给了三个值则以给的值为准，不给以这个为准（比如只给两个，那么剩下一个就以这个列表为准）【4-3】
	Clock(int H = 1, int M = 2, int S = 3):nTest(99) {   //无参和带参可以合二为一，还是带参构造，给带参的参数设置默认值（其实是带参）
		
		/*
		//【5-1】
		nTest = 900;//常数据成员不能修改，一旦赋值相当于试图进行修改
		//想初始化怎么办？——在对象还没诞生的时候进行初始化——在构造函数的外部进行初始化
		*/



		if (H < 0 || H>24) {
			H = 0;//M S 相同
		}
		this->H = H; this->M = M; this->S = S;
		cout << "【构造被调用】" << endl;
	}


	/*
	* 【5-2】
	* 上面Clock修改为：
	Clock(int H = 1, int M = 2, int S = 3) :nTest(H){ 

	if (H < 0 || H>24) {
		H = 0;//M S 相同
	}
	this->H = H; this->M = M; this->S = S;

}

	
	*/






public:
	//右修饰为const,表成员函数（这个函数对数据成员只读不写，则应该修饰为常成员函数
	void display()const {
		cout << H << ":" << M << ":" << S << endl;
	}

	};
	int main()
	{
		
		Clock c1(0,0,0);
		Clock c2(33, 12, 12);
		Clock c3(11);//【4-3】就是11 2 3 

		//【7-3】创建c4 c5 调用的是拷贝构造函数
		Clock c4 = c2;//这里不是赋值运算，在定义对象时进行赋值=，不是赋值，是拷贝构造【7】
		Clock c5(c2);
		
		//【7-1】c4 = c2;//这里是赋值运算

		c1.display();
		c2.display();
		c3.display();


		// 【4-1】对象数组必须要求【无参构造】——如何解决？必须无参构造允许存在（上一个笔记
		//【4-2】另一种方法
		Clock aClock[5];//【4-1】创建一个时钟的数组——出现问题了
	    //【4-4】
		for (int i = 0; i < 5; i++) {
			aClock[i].display();
		}

		return 0;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
/*


/*
1.一个类必须有：
  构造函数：（如果没写，系统会帮助写）
  析构函数：【6】当需要释放资源（如:内存）时，应在析构函数里进行  
          析构函数大多时候不编写，但如果申请了动态的内存分配，要编写
  拷贝构造函数：【7-3】以下情况将调用拷贝构造函数
                     1）实参传形参（非引用型，对象型？
					 2）函数返回的是对象
					 3）显示调用
  赋值运算（当需要深拷贝）


2.一些特殊的成员
 常成员：常数据成员必须在构造函数的【外部（进行）初始化】   【5-1】
 静态成员：

*/

#include<iostream>

using namespace std;

/*【7-1】
void Swap(int a, int b)
{
	int x = a; a = b; b = x;
}
*/
//a b 是【引用型】形参，它的改变将影响实参
//引用不会产生新的对象，它就是实参，是实参的别名

void Swap(int &a, int &b)
{
	int x = a; a = b; b = x;
}

class Clock {
private:
	const int nTest;//【5】常数据成员——出错了   常数据成员的初始化
	int H;
	int M;
	int S;



public:
	
	//具有【默认值】的带参构造【4-2】


	//给了三个值则以给的值为准，不给以这个为准（比如只给两个）【4-3】
	Clock(int H = 1, int M = 2, int S = 3):nTest(99) {   //无参和带参可以合二为一，还是带参构造，给带参的参数设置默认值（其实是带参）
		
		/*
		//【5-1】
		nTest = 900;//常数据成员不能修改，一旦赋值相当于试图进行修改
		//想初始化怎么办？——在对象还没诞生的时候进行初始化——在构造函数的外部进行初始化
		*/



		if (H < 0 || H>24) {
			H = 0;//M S 相同
		}
		this->H = H; this->M = M; this->S = S;
		cout << "【构造被调用】" << endl;
	}


	/*
	* 【5-2】
	* 上面Clock修改为：
	Clock(int H = 1, int M = 2, int S = 3) :nTest(21){ 
	nTest=99;
	if (H < 0 || H>24) {
		H = 0;//M S 相同
	}
	this->H = H; this->M = M; this->S = S;

}

	
	*/


	//【7】拷贝构造函数
	/*
	一种特殊的构造函数，用于用一个已存在的对象初始化另一个新对象。

	函数形式：Clock(const Clock &source);。
	//【7-2】
	拷贝构造函数的形参是该类的【引用型对象】
	则它是【拷贝构造函数】
	使用引用，又不希望其值被改变，则可
	【左修饰】为const，称为常引用
	最常用的常引用
	：无法修改其值，只读不写
	*/
	Clock(const  Clock& src) :nTest(666) {//实参传形参要调用拷贝构造函数
		H = src.H; M = src.M; S = src.S;
		cout << "拷贝构造" << endl;

	}




public:
	//右修饰为const,表成员函数（这个函数对数据成员只读不写，则应该修饰为常成员函数
	void display()const {
		cout << H << ":" << M << ":" << S << endl;
	}

	};
	int main()
	{
		
		Clock c1(0,0,0);
		Clock c2(33, 12, 12);
		Clock c3(11);//【4-3】就是11 2 3 

		//【7-3】创建c4 c5 调用的是拷贝构造函数
		Clock c4 = c2;//这里不是赋值运算，在定义对象时进行赋值=，不是赋值，是拷贝构造【7】
		Clock c5(c2);
		
		//【7-1】c4 = c2;//这里是赋值运算

		c1.display();
		c2.display();
		c3.display();


		// 【4-1】对象数组必须要求【无参构造】——如何解决？必须无参构造允许存在（上一个笔记
		//【4-2】另一种方法
		Clock aClock[5];//【4-1】创建一个时钟的数组——出现问题了
	    //【4-4】
		for (int i = 0; i < 5; i++) {
			aClock[i].display();
		}
		cout << "\n\n";
		int aa = 888;
		int& bb = aa;
		//内存中只有一个整型变量，bb就是aa

		bb = 666666;
		cout << "aa=" << aa << endl;
		return 0;
	}












	一些区分： 
		常成员函数（常成员）
		定义：在成员函数声明末尾加上 const 关键字。
		作用：告诉编译器“这个函数不会修改任何成员变量”
		void display() const;



	    常数据成员
		定义：成员变量声明时加上 const 关键字。
		作用：该变量的值在对象整个生命周期中不能改变。
			class Student {
			private:
				const int id;        // 常数据成员
			public:
				Student(int i) : id(i) {}   // 必须在初始化列表中初始化
		}; 只能在构造函数的初始化列表中赋值，之后不能再修改


		静态成员属于类 
			static int y；



			引用相当于起了外号，改变引用也就改变了原变量，
			如果不想修改原变量，可以使用const引用
			void print(const int& x) {
			// x = 10;   // 错误！常引用不能修改
			cout << x;
		}
		常引用还有个好处：可以接受临时变量或字面量，而普通引用不行
			int& r1 = 10;      // 错误：普通引用不能绑定到字面量
		const int& r2 = 10; // 正确：常引用可以